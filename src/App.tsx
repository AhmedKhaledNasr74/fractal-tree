import { useEffect, useState } from "react";
import "./App.css";
import { Circle, Layer, Line, Stage } from "react-konva";
import "./style.css";

function App() {
    const [branches, setBranches] = useState([
        {
            x: window.innerWidth / 2,
            y: window.innerHeight,
            points: [0, 0, 0, -150],
            finished: false,
            level: 0,
        },
    ]);

    const [clicks, setClicks] = useState(0);
    const [isAnimatingRight, setIsAnimatingRight] = useState(false);
    const [isAnimatingLeft, setIsAnimatingLeft] = useState(false);
    const [canAnimate, setCanAnimate] = useState(true);
    const [scrollPattern, setScrollPattern] = useState([] as string[]); // To track scroll pattern
    const [scrollCount, setScrollCount] = useState(0); // Track successful down-up sequences
    const [falling, setFalling] = useState(false); // To trigger falling of circles
    const [circlesFalling, setCirclesFalling] = useState<
        { x: number; y: number }[]
    >([]); // Store multiple falling circles

    const [velocity, setVelocity] = useState(0.05); // Control the speed of movement

    // Function to move circles down when falling is triggered
    useEffect(() => {
        if (!falling) return;

        const moveCircles = () => {
            setCirclesFalling((prevCircles) =>
                prevCircles.map((circle) => ({
                    ...circle,
                    y: circle.y + velocity,
                }))
            );

            const allCirclesStopped = circlesFalling.every(
                (circle) => circle.y >= window.innerHeight - 50
            );
            if (allCirclesStopped) {
                setFalling(false); // Stop the falling if all circles reach the bottom
            } else {
                requestAnimationFrame(moveCircles);
            }
        };

        requestAnimationFrame(moveCircles);
    }, [falling, circlesFalling, velocity]);

    const drawNewBranches = () => {
        console.log(branches);
        if (clicks >= 5) return;
        else setClicks(clicks + 1);
        let newTree = [...branches];
        let angles = [45];
        for (let i = newTree.length - 1; i >= 0; i--) {
            if (!newTree[i].finished) {
                let pointsOfRoot = newTree[i].points;
                let newRightBranch = {
                    x: newTree[i].x + pointsOfRoot[2],
                    y: newTree[i].y + pointsOfRoot[3],
                    points: [
                        0,
                        0,
                        pointsOfRoot[2] +
                            angles[Math.floor(Math.random() * angles.length)],
                        pointsOfRoot[3] * 0.8,
                    ],
                    finished: false,
                    level: newTree[i].level + 1,
                };

                let newLeftBranch = {
                    x: newTree[i].x + pointsOfRoot[2],
                    y: newTree[i].y + pointsOfRoot[3],
                    points: [
                        0,
                        0,
                        pointsOfRoot[2] +
                            angles[Math.floor(Math.random() * angles.length)] *
                                -1,
                        pointsOfRoot[3] * 0.8,
                    ],
                    finished: false,
                    level: newTree[i].level + 1,
                };
                newTree[i].finished = true;
                newTree.push(newRightBranch);
                newTree.push(newLeftBranch);
            }

            setBranches(newTree);
        }
    };

    const handleWheel = (event: any) => {
        if (event.deltaY > 0) {
            onScrollDown();
        } else {
            onScrollUp();
        }
    };

    const onScrollDown = () => {
        if (canAnimate) {
            console.log("Scrolling down");
            setIsAnimatingRight(true);
            setScrollPattern([...scrollPattern, "down"]);

            setTimeout(() => {
                setIsAnimatingRight(false);
            }, 500);
            setCanAnimate(false);
            setTimeout(() => {
                setCanAnimate(true);
            }, 500);

            checkScrollPattern();
        }
    };

    const onScrollUp = () => {
        if (canAnimate) {
            console.log("Scrolling up");
            setIsAnimatingLeft(true);
            setScrollPattern([...scrollPattern, "up"]);

            setTimeout(() => {
                setIsAnimatingLeft(false);
            }, 500);
            setCanAnimate(false);
            setTimeout(() => {
                setCanAnimate(true);
            }, 500);

            checkScrollPattern();
        }
    };

    const checkScrollPattern = () => {
        const pattern = [...scrollPattern, "up"];
        if (pattern.length >= 2) {
            const lastTwo = pattern.slice(-2);
            if (lastTwo[0] === "down" && lastTwo[1] === "up") {
                setScrollCount(scrollCount + 1);
            }
        }

        if (scrollCount === 2) {
            triggerCircleFall();
            setScrollCount(0);
        }
    };

    const triggerCircleFall = () => {
        // Collect positions for circles to fall from branches
        const newCircles = branches
            .filter((branch) => branch.level === 5)
            .map((branch) => ({
                x: branch.x + branch.points[2],
                y: branch.y + branch.points[3],
            }));

        setCirclesFalling(newCircles); // Set falling circles
        setFalling(true); // Start falling
    };

    return (
        <main
            onClick={drawNewBranches}
            onWheel={handleWheel}
            className={`${isAnimatingRight && "rotateRight "} ${
                isAnimatingLeft && " rotateLeft"
            }`}
        >
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    {branches.map((branch, index) =>
                        branch.level === 5 ? (
                            <>
                                <Line
                                    x={branch.x}
                                    y={branch.y}
                                    points={branch.points}
                                    stroke="white"
                                    strokeWidth={3}
                                />
                                {!falling && (
                                    <Circle
                                        x={branch.x + branch.points[2]}
                                        y={branch.y + branch.points[3]}
                                        radius={10}
                                        fill="red"
                                    />
                                )}
                            </>
                        ) : (
                            <Line
                                x={branch.x}
                                y={branch.y}
                                points={branch.points}
                                stroke="white"
                                strokeWidth={3}
                            />
                        )
                    )}
                    {falling &&
                        circlesFalling.map((circle, index) => (
                            <Circle
                                x={circle.x}
                                y={circle.y}
                                radius={10}
                                fill="red"
                            />
                        ))}
                </Layer>
            </Stage>
            {isAnimatingRight && (
                <>
                    <div className="air-effect-right" />
                    <div className="air-effect-right air-effect1" />
                    <div className="air-effect-right air-effect2" />
                    <div className="air-effect-right air-effect3" />
                </>
            )}
            {isAnimatingLeft && (
                <>
                    <div className="air-effect-left" />
                    <div className="air-effect-left air-effect1" />
                    <div className="air-effect-left air-effect2" />
                    <div className="air-effect-left air-effect3" />
                </>
            )}
        </main>
    );
}

export default App;
