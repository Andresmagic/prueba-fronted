import React, { useRef, useState, useEffect } from "react"
import Moveable from "react-moveable"

const Component = ({
  updateMoveable,
  deleteMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imageUrl,
  fit = "cover", // Default fit style is "cover"
}) => {
  const ref = useRef()
  const parentBounds = useRef()

  // Function to handle drag start
  const onDragStart = ({ set }) => {
    set([left, top])
  }

  // Function to handle drag
  const onDrag = ({ beforeTranslate: [translateX, translateY] }) => {
    let newTop = translateY
    let newLeft = translateX

    // Check if the new position is within the parent's boundaries
    if (newTop < 0) newTop = 0
    if (newLeft < 0) newLeft = 0
    if (newTop + height > parentBounds.current.height)
      newTop = parentBounds.current.height - height
    if (newLeft + width > parentBounds.current.width)
      newLeft = parentBounds.current.width - width

    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width,
      height,
      color,
    })
  }

  // Function to handle resize start
  const onResizeStart = ({ setOrigin, dragStart }) => {
    setOrigin(["%", "%"])
    if (dragStart) {
      dragStart.set([left, top])
    }
  }

  // Function to handle resize
  const onResize = ({
    target,
    width: newWidth,
    height: newHeight,
    drag: {
      beforeTranslate: [translateX, translateY],
    },
  }) => {
    let newTop = translateY
    let newLeft = translateX

    // Check if the new size is within the parent's boundaries
    if (newTop < 0) newTop = 0
    if (newLeft < 0) newLeft = 0
    if (newTop + newHeight > parentBounds.current.height)
      newHeight = parentBounds.current.height - newTop
    if (newLeft + newWidth > parentBounds.current.width)
      newWidth = parentBounds.current.width - newLeft

    target.style.width = `${newWidth}px`
    target.style.height = `${newHeight}px`

    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width: newWidth,
      height: newHeight,
      color,
    })
  }

  useEffect(() => {
    parentBounds.current = document
      .getElementById("parent")
      ?.getBoundingClientRect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        className="component" // Updated class name
        id={"component-" + id}
        style={{
          position: "absolute",
          top,
          left,
          width,
          height,
          background: color,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: fit, // Apply the specified fit style
        }}
        onClick={() => setSelected(id)}
      >
        <button onClick={() => deleteMoveable(id)}>Delete</button>
      </div>

      <Moveable
        target={isSelected ? ref.current : null}
        resizable
        draggable
        onDragStart={onDragStart}
        onDrag={onDrag}
        onResizeStart={onResizeStart}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  )
}

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([])
  const [selected, setSelected] = useState(null)
// fetch the data from the API
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((data) => {
        const images = data.map((item) => item.url)
        setMoveableComponents((prev) =>
          prev.map((item, index) => ({
            ...item,
            imageUrl: images[index % images.length],
          }))
        )
      })
  }, [])
// I kept the colors 'cause I had a laggy problem with the images from the API
  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"]
    setMoveableComponents((prevMoveableComponents) => [
      ...prevMoveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        fit: "contain",
      },
    ])
  }
// for updating the moveable
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    setMoveableComponents((prevMoveableComponents) =>
      prevMoveableComponents.map((moveable) =>
        moveable.id === id ? { id, ...newComponent, updateEnd } : moveable
      )
    )
  }
// for deleteing the moveable
  const deleteMoveable = (id) => {
    setMoveableComponents((prevMoveableComponents) =>
      prevMoveableComponents.filter((moveable) => moveable.id !== id)
    )
  }

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item) => (
          <Component
            {...item}
            key={item.id}
            updateMoveable={updateMoveable}
            deleteMoveable={deleteMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  )
}

export default App