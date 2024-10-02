import { useEffect, useRef, useState } from "react"
import "./App.css"

const App = () => {
  const [maxNumber, setMaxNumber] = useState("")
  const [numbers, setNumbers] = useState([])
  const [clearedNumbers, setClearedNumbers] = useState([])
  const [positions, setPositions] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [nextExpectedNumber, setNextExpectedNumber] = useState(1)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  const handlePlayButtonClick = () => {
    const n = parseInt(maxNumber)
    if (!n || n === 0) return alert("Invalid points")

    const generatedNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1)
    setNumbers(generatedNumbers)
    setClearedNumbers([])
    setPositions(generateCirclePositions(generatedNumbers.length))
    setGameStarted(true)
    startTimer()
  }
  const handleRestartButtonClick = () => {
    const n = parseInt(maxNumber)
    if (!n || n === 0) return alert("Invalid points")
    setGameOver(false)
    reset()
    const generatedNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1)
    setNumbers(generatedNumbers)
    setClearedNumbers([])
    setPositions(generateCirclePositions(generatedNumbers.length))
    startTimer()
  }

  const generateCirclePositions = (count) => {
    const positions = []
    const canvasWidth = canvasRef.current.width
    const canvasHeight = canvasRef.current.height
    const radius = 20

    for (let i = 0; i < count; i++) {
      let x, y
      x = Math.floor(Math.random() * (canvasWidth - 2 * radius)) + radius // Keep within bounds
      y = Math.floor(Math.random() * (canvasHeight - 2 * radius)) + radius // Keep within bounds

      positions.push({ x, y, number: i + 1 })
    }

    return positions
  }
  const drawCircle = (ctx, posX, posY, index) => {
    ctx.beginPath()
    ctx.arc(posX, posY, 20, 0, 2 * Math.PI)
    ctx.fillStyle = "#eeeeee"
    ctx.fill()
    ctx.strokeStyle = "black"
    ctx.stroke()
    ctx.font = "20px Arial"
    //Center text in circle
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"
    ctx.fillText(numbers[index], posX, posY)
  }

  const drawCircles = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = positions.length - 1; i >= 0; i--) {
      if (clearedNumbers.includes(numbers[i])) return // Skip cleared numbers
      drawCircle(ctx, positions[i].x, positions[i].y, i)
    }
  }

  const handleCanvasClick = (e) => {
    if (gameOver) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left // Click x-coordinate
    const clickY = e.clientY - rect.top // Click y-coordinate

    const radius = 20
    const clickedCircles = positions.filter((pos) => {
      const distance = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2)
      return distance < radius // Check if the click is within the circle
    })
    if (clickedCircles.length > 0) {
      const selectedCircle = clickedCircles[0] // Get the smallest number circle
      // Check if the clicked number is the next expected number
      if (selectedCircle.number === nextExpectedNumber) {
        ctx.beginPath()
        ctx.arc(selectedCircle.x, selectedCircle.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = "#FE8384"
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.fillText(selectedCircle.number, selectedCircle.x, selectedCircle.y)
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawCircles()
          ctx.beginPath()
          ctx.arc(selectedCircle.x, selectedCircle.y, radius, 0, 2 * Math.PI)
          ctx.fillStyle = "#BC1401"
          ctx.fill()
          ctx.fillStyle = "black"
          ctx.fillText(selectedCircle.number, selectedCircle.x, selectedCircle.y)
          setTimeout(() => {
            // Clear the circle
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawCircles() // Redraw all remaining circles

            // Update cleared numbers and expected number
            setClearedNumbers((prev) => [...prev, selectedCircle.number])
            setNextExpectedNumber(nextExpectedNumber + 1)

            // Check for win condition
            if (clearedNumbers.length + 1 === positions.length) {
              setIsWon(true)
              stopTimer()
            }
          }, 300)
        }, 200)
      } else {
        setGameOver(true)
        stopTimer()
      }
    }
  }

  const formatTime = (milliseconds) => {
    const seconds = (milliseconds / 1000).toFixed(1)
    return `${seconds}s`
  }
  const startTimer = () => {
    setTimer(0)
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 100)
    }, 100)
  }
  const stopTimer = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const reset = () => {
    setClearedNumbers([])
    setNextExpectedNumber(1)
    setGameOver(false)
    setPositions([])
    setNumbers([])
    setIsWon(false)
    stopTimer()
    setTimer(0)
  }
  useEffect(() => {
    drawCircles()
  }, [numbers, clearedNumbers, positions])
  return (
    <div className="app">
      <h2 style={{ color: isWon ? "green" : gameOver ? "red" : "black" }}>
        {isWon ? "All Cleared" : gameOver ? "Game Over" : "Let's Play"}
      </h2>
      <div className="flex">
        <label style={{ marginRight: "10px" }} htmlFor="points">
          Points:
        </label>
        <input id="points" type="text" value={maxNumber} onChange={(e) => setMaxNumber(e.target.value)} />
      </div>
      <p>Time: {formatTime(timer)}</p>
      <button onClick={gameStarted ? handleRestartButtonClick : handlePlayButtonClick}>
        {gameStarted ? "Restart" : "Play"}
      </button>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", marginTop: "20px" }}
        width={600}
        height={600}
        onClick={handleCanvasClick}
      />
    </div>
  )
}

export default App
