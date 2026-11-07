import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Rect,
  Circle,
  Ellipse,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

const ANDROID_GREEN = 'rgb(164, 198, 57)';
const CANVAS_BACKGROUND = '#FFFFFF';

export default function App() {
  const [color, setColor] = useState(ANDROID_GREEN);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [tool, setTool] = useState('pen');
  const [filled, setFilled] = useState(false);

  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedShapeId, setSelectedShapeId] = useState(null);

  const startPoint = useRef(null);
  const currentPathRef = useRef('');
  const currentPathBoundsRef = useRef(null);
  const currentShapeRef = useRef(null);

  const movingShapeIdRef = useRef(null);
  const moveStartPointRef = useRef(null);
  const moveOriginalOffsetRef = useRef(null);

  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);

  function startDrawing(x, y) {
    if (tool === 'move') {
      startMovingShape(x, y);
      return;
    }

    startPoint.current = { x, y };

    if (tool === 'pen' || tool === 'eraser') {
      const newPath = `M ${x} ${y}`;
      currentPathRef.current = newPath;
      currentPathBoundsRef.current = {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
      };
      setCurrentPath(newPath);
    } else {
      const newShape = {
        tool: tool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: color,
        strokeWidth: strokeWidth,
        filled: filled,
        offsetX: 0,
        offsetY: 0,
      };

      currentShapeRef.current = newShape;
      setCurrentShape(newShape);
    }
  }

  function moveDrawing(x, y) {
    if (tool === 'move') {
      moveSelectedShape(x, y);
      return;
    }

    if (!startPoint.current) return;

    if (tool === 'pen' || tool === 'eraser') {
      updateCurrentPathBounds(x, y);

      setCurrentPath((previousPath) => {
        const nextPath = `${previousPath} L ${x} ${y}`;
        currentPathRef.current = nextPath;
        return nextPath;
      });
    } else {
      const updatedShape = {
        tool: tool,
        startX: startPoint.current.x,
        startY: startPoint.current.y,
        endX: x,
        endY: y,
        color: color,
        strokeWidth: strokeWidth,
        filled: filled,
        offsetX: 0,
        offsetY: 0,
      };

      currentShapeRef.current = updatedShape;
      setCurrentShape(updatedShape);
    }
  }

  function endDrawing() {
    if (tool === 'move') {
      movingShapeIdRef.current = null;
      moveStartPointRef.current = null;
      moveOriginalOffsetRef.current = null;
      return;
    }

    if (tool === 'pen' || tool === 'eraser') {
      if (currentPathRef.current !== '') {
        const newShapeId = createShapeId();

        const newShape = {
          id: newShapeId,
          tool: tool,
          path: currentPathRef.current,
          bounds: currentPathBoundsRef.current,
          color: tool === 'eraser' ? CANVAS_BACKGROUND : color,
          strokeWidth:
            tool === 'eraser' ? Math.max(strokeWidth, 24) : strokeWidth,
          filled: false,
          offsetX: 0,
          offsetY: 0,
        };

        setShapes((previousShapes) => [...previousShapes, newShape]);

        if (tool !== 'eraser') {
          setSelectedShapeId(newShapeId);
        }
      }

      currentPathRef.current = '';
      currentPathBoundsRef.current = null;
      setCurrentPath('');
    } else {
      if (currentShapeRef.current) {
        const savedShape = currentShapeRef.current;

        const distanceMoved =
          Math.abs(savedShape.endX - savedShape.startX) +
          Math.abs(savedShape.endY - savedShape.startY);

        if (distanceMoved > 4) {
          const newShapeId = createShapeId();

          const completedShape = {
            ...savedShape,
            id: newShapeId,
          };

          setShapes((previousShapes) => [...previousShapes, completedShape]);
          setSelectedShapeId(newShapeId);
        }

        currentShapeRef.current = null;
        setCurrentShape(null);
      }
    }

    startPoint.current = null;
  }

  function updateCurrentPathBounds(x, y) {
    if (!currentPathBoundsRef.current) {
      currentPathBoundsRef.current = {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
      };
      return;
    }

    currentPathBoundsRef.current = {
      minX: Math.min(currentPathBoundsRef.current.minX, x),
      minY: Math.min(currentPathBoundsRef.current.minY, y),
      maxX: Math.max(currentPathBoundsRef.current.maxX, x),
      maxY: Math.max(currentPathBoundsRef.current.maxY, y),
    };
  }

  function startMovingShape(x, y) {
    const shapeToMove = findTopShapeAtPoint(x, y, shapes);

    if (!shapeToMove) {
      setSelectedShapeId(null);
      return;
    }

    setSelectedShapeId(shapeToMove.id);

    movingShapeIdRef.current = shapeToMove.id;
    moveStartPointRef.current = { x, y };
    moveOriginalOffsetRef.current = {
      offsetX: shapeToMove.offsetX || 0,
      offsetY: shapeToMove.offsetY || 0,
    };
  }

  function moveSelectedShape(x, y) {
    if (
      !movingShapeIdRef.current ||
      !moveStartPointRef.current ||
      !moveOriginalOffsetRef.current
    ) {
      return;
    }

    const changeX = x - moveStartPointRef.current.x;
    const changeY = y - moveStartPointRef.current.y;

    setShapes((previousShapes) =>
      previousShapes.map((shape) => {
        if (shape.id !== movingShapeIdRef.current) {
          return shape;
        }

        return {
          ...shape,
          offsetX: moveOriginalOffsetRef.current.offsetX + changeX,
          offsetY: moveOriginalOffsetRef.current.offsetY + changeY,
        };
      })
    );
  }

  const canvasResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (event) => {
      startDrawing(event.nativeEvent.locationX, event.nativeEvent.locationY);
    },

    onPanResponderMove: (event) => {
      moveDrawing(event.nativeEvent.locationX, event.nativeEvent.locationY);
    },

    onPanResponderRelease: () => {
      endDrawing();
    },

    onPanResponderTerminate: () => {
      endDrawing();
    },
  });

  function undoMostRecentShape() {
    setShapes((previousShapes) => previousShapes.slice(0, -1));
    setSelectedShapeId(null);
  }

  function clearCanvas() {
    setShapes([]);
    setCurrentShape(null);
    setCurrentPath('');
    setSelectedShapeId(null);

    currentPathRef.current = '';
    currentPathBoundsRef.current = null;
    currentShapeRef.current = null;
    startPoint.current = null;

    movingShapeIdRef.current = null;
    moveStartPointRef.current = null;
    moveOriginalOffsetRef.current = null;
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle="dark-content" />

      <TopToolbar
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        tool={tool}
        setTool={setTool}
        filled={filled}
        setFilled={setFilled}
      />

      <View style={styles.canvasWrapper}>
        <View style={styles.canvas} {...canvasResponder.panHandlers}>
          <Svg height="100%" width="100%">
            {shapes.map((shape) => (
              <G
                key={shape.id}
                transform={`translate(${shape.offsetX || 0}, ${
                  shape.offsetY || 0
                })`}>
                <ShapeRenderer shape={shape} />
              </G>
            ))}

            {selectedShape && <SelectionBox shape={selectedShape} />}

            {currentPath !== '' && (
              <Path
                d={currentPath}
                stroke={tool === 'eraser' ? CANVAS_BACKGROUND : color}
                strokeWidth={
                  tool === 'eraser' ? Math.max(strokeWidth, 24) : strokeWidth
                }
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {currentShape && <ShapeRenderer shape={currentShape} />}
          </Svg>
        </View>
      </View>

      <BottomToolbar
        undoMostRecentShape={undoMostRecentShape}
        clearCanvas={clearCanvas}
        setTool={setTool}
        tool={tool}
      />
    </SafeAreaView>
  );
}

function ShapeRenderer({ shape }) {
  const fillColor = shape.filled ? shape.color : 'none';

  if (shape.tool === 'pen' || shape.tool === 'eraser') {
    return (
      <Path
        d={shape.path}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  if (shape.tool === 'line') {
    return (
      <Line
        x1={shape.startX}
        y1={shape.startY}
        x2={shape.endX}
        y2={shape.endY}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
    );
  }

  if (shape.tool === 'rect') {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);
    const width = Math.abs(shape.endX - shape.startX);
    const height = Math.abs(shape.endY - shape.startY);

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
      />
    );
  }

  if (shape.tool === 'roundRect') {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);
    const width = Math.abs(shape.endX - shape.startX);
    const height = Math.abs(shape.endY - shape.startY);
    const radius = Math.min(width, height) / 3;

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
      />
    );
  }

  if (shape.tool === 'square') {
    const side = Math.min(
      Math.abs(shape.endX - shape.startX),
      Math.abs(shape.endY - shape.startY)
    );

    const x = shape.endX < shape.startX ? shape.startX - side : shape.startX;
    const y = shape.endY < shape.startY ? shape.startY - side : shape.startY;

    return (
      <Rect
        x={x}
        y={y}
        width={side}
        height={side}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
      />
    );
  }

  if (shape.tool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(shape.endX - shape.startX, 2) +
        Math.pow(shape.endY - shape.startY, 2)
    );

    return (
      <Circle
        cx={shape.startX}
        cy={shape.startY}
        r={radius}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
      />
    );
  }

  if (shape.tool === 'oval') {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);
    const width = Math.abs(shape.endX - shape.startX);
    const height = Math.abs(shape.endY - shape.startY);

    return (
      <Ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
      />
    );
  }

  if (shape.tool === 'dome') {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);
    const width = Math.abs(shape.endX - shape.startX);
    const height = Math.abs(shape.endY - shape.startY);

    const path = `
      M ${x} ${y + height}
      C ${x} ${y + height * 0.35},
        ${x + width * 0.25} ${y},
        ${x + width / 2} ${y}
      C ${x + width * 0.75} ${y},
        ${x + width} ${y + height * 0.35},
        ${x + width} ${y + height}
      L ${x} ${y + height}
      Z
    `;

    return (
      <Path
        d={path}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fillColor}
        strokeLinejoin="round"
      />
    );
  }

  return null;
}

function SelectionBox({ shape }) {
  const bounds = getShapeBounds(shape);

  if (!bounds) return null;

  const padding = 6;
  const offsetX = shape.offsetX || 0;
  const offsetY = shape.offsetY || 0;

  return (
    <Rect
      x={bounds.x + offsetX - padding}
      y={bounds.y + offsetY - padding}
      width={bounds.width + padding * 2}
      height={bounds.height + padding * 2}
      stroke="#111111"
      strokeWidth={2}
      strokeDasharray="6 4"
      fill="none"
    />
  );
}

function TopToolbar({
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  tool,
  setTool,
  filled,
  setFilled,
}) {
  const wheelSize = 92;
  const wheelRadius = wheelSize / 2;

  const [pickerX, setPickerX] = useState(wheelRadius);
  const [pickerY, setPickerY] = useState(wheelRadius);

  function colorFromWheelPosition(x, y) {
    const centerX = wheelRadius;
    const centerY = wheelRadius;

    const changeX = x - centerX;
    const changeY = y - centerY;

    const distanceFromCenter = Math.sqrt(
      Math.pow(changeX, 2) + Math.pow(changeY, 2)
    );

    const clampedDistance = Math.min(distanceFromCenter, wheelRadius);

    const angle = Math.atan2(changeY, changeX);

    const finalX = centerX + Math.cos(angle) * clampedDistance;
    const finalY = centerY + Math.sin(angle) * clampedDistance;

    setPickerX(finalX);
    setPickerY(finalY);

    const hue = ((angle * 180) / Math.PI + 360) % 360;
    const saturation = clampedDistance / wheelRadius;
    const value = 1;

    const rgbColor = hsvToRgb(hue, saturation, value);
    setColor(rgbColor);
  }

  const colorWheelResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      colorFromWheelPosition(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY
      );
    },

    onPanResponderMove: (event) => {
      colorFromWheelPosition(
        event.nativeEvent.locationX,
        event.nativeEvent.locationY
      );
    },
  });

  function increaseSize() {
    setStrokeWidth((previousSize) => Math.min(previousSize + 2, 35));
  }

  function decreaseSize() {
    setStrokeWidth((previousSize) => Math.max(previousSize - 2, 1));
  }

  return (
    <View style={styles.topToolbar}>
      <Text style={styles.title}>Painter Vadali</Text>
      <Text style={styles.subtitle}>Current Tool: {formatToolName(tool)}</Text>

      <View style={styles.toolbarContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Color Wheel</Text>

          <View
            style={[
              styles.colorWheelWrapper,
              {
                width: wheelSize,
                height: wheelSize,
                borderRadius: wheelRadius,
              },
            ]}
            {...colorWheelResponder.panHandlers}>
            <Svg width={wheelSize} height={wheelSize} viewBox="0 0 100 100">
              <Defs>
                <RadialGradient id="whiteCenter" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {createHueWheelSegments()}

              <Circle cx="50" cy="50" r="50" fill="url(#whiteCenter)" />

              <Circle
                cx="50"
                cy="50"
                r="49"
                stroke="#333333"
                strokeWidth="1"
                fill="none"
              />
            </Svg>

            <View
              pointerEvents="none"
              style={[
                styles.pickerCircle,
                {
                  left: pickerX - 8,
                  top: pickerY - 8,
                },
              ]}
            />
          </View>

          <View style={styles.presetRow}>
            <ColorButton color={ANDROID_GREEN} setColor={setColor} />
            <ColorButton color="#000000" setColor={setColor} />
            <ColorButton color="#FFFFFF" setColor={setColor} />
            <ColorButton color="#FF0000" setColor={setColor} />
            <ColorButton color="#0066FF" setColor={setColor} />
          </View>

          <View style={[styles.colorPreview, { backgroundColor: color }]} />
        </View>

        <View style={styles.sectionWide}>
          <Text style={styles.label}>Drawing Tools</Text>

          <View style={styles.toolGrid}>
            <ToolButton
              label="Pen"
              icon="✎"
              name="pen"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Move"
              icon="↕"
              name="move"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Line"
              icon="╱"
              name="line"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Rect"
              icon="▭"
              name="rect"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Round"
              icon="▢"
              name="roundRect"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Square"
              icon="□"
              name="square"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Circle"
              icon="○"
              name="circle"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Oval"
              icon="⬭"
              name="oval"
              tool={tool}
              setTool={setTool}
            />
            <ToolButton
              label="Dome"
              icon="◠"
              name="dome"
              tool={tool}
              setTool={setTool}
            />
          </View>

          <TouchableOpacity
            style={[styles.fillButton, filled && styles.activeTool]}
            onPress={() => setFilled(!filled)}>
            <Text style={styles.fillText}>
              {filled ? 'Filled Shapes: ON' : 'Filled Shapes: OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Size: {Math.round(strokeWidth)}px</Text>

          <View style={styles.sizeButtonRow}>
            <TouchableOpacity style={styles.sizeButton} onPress={decreaseSize}>
              <Text style={styles.sizeButtonText}>−</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sizeButton} onPress={increaseSize}>
              <Text style={styles.sizeButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.strokePreviewBox}>
            <View
              style={[
                styles.strokePreview,
                {
                  height: strokeWidth,
                  borderRadius: strokeWidth / 2,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function ColorButton({ color, setColor }) {
  return (
    <TouchableOpacity
      style={[styles.colorButton, { backgroundColor: color }]}
      onPress={() => {
        setColor(color);
      }}
    />
  );
}

function ToolButton({ icon, label, name, tool, setTool }) {
  return (
    <TouchableOpacity
      style={[styles.toolButton, tool === name && styles.activeTool]}
      onPress={() => setTool(name)}>
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function BottomToolbar({ undoMostRecentShape, clearCanvas, setTool, tool }) {
  return (
    <View style={styles.bottomToolbar}>
      <TouchableOpacity
        style={styles.bottomButton}
        onPress={undoMostRecentShape}>
        <Text style={styles.bottomText}>Undo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.bottomButton,
          tool === 'eraser' && styles.activeBottomButton,
        ]}
        onPress={() => setTool('eraser')}>
        <Text style={styles.bottomText}>Eraser</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomButton} onPress={clearCanvas}>
        <Text style={styles.bottomText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}

function createShapeId() {
  return `${Date.now()}-${Math.random()}`;
}

function createHueWheelSegments() {
  const segments = [];
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  const totalSegments = 72;

  for (let index = 0; index < totalSegments; index++) {
    const startAngle = (index / totalSegments) * 2 * Math.PI;
    const endAngle = ((index + 1) / totalSegments) * 2 * Math.PI;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);

    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const hue = (index / totalSegments) * 360;
    const fillColor = hsvToRgb(hue, 1, 1);

    const path = `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 0 1 ${endX} ${endY}
      Z
    `;

    segments.push(<Path key={index} d={path} fill={fillColor} />);
  }

  return segments;
}

function hsvToRgb(hue, saturation, value) {
  const chroma = value * saturation;
  const hueSection = hue / 60;
  const secondLargestComponent = chroma * (1 - Math.abs((hueSection % 2) - 1));
  const matchValue = value - chroma;

  let redPrime = 0;
  let greenPrime = 0;
  let bluePrime = 0;

  if (hueSection >= 0 && hueSection < 1) {
    redPrime = chroma;
    greenPrime = secondLargestComponent;
    bluePrime = 0;
  } else if (hueSection >= 1 && hueSection < 2) {
    redPrime = secondLargestComponent;
    greenPrime = chroma;
    bluePrime = 0;
  } else if (hueSection >= 2 && hueSection < 3) {
    redPrime = 0;
    greenPrime = chroma;
    bluePrime = secondLargestComponent;
  } else if (hueSection >= 3 && hueSection < 4) {
    redPrime = 0;
    greenPrime = secondLargestComponent;
    bluePrime = chroma;
  } else if (hueSection >= 4 && hueSection < 5) {
    redPrime = secondLargestComponent;
    greenPrime = 0;
    bluePrime = chroma;
  } else {
    redPrime = chroma;
    greenPrime = 0;
    bluePrime = secondLargestComponent;
  }

  const red = Math.round((redPrime + matchValue) * 255);
  const green = Math.round((greenPrime + matchValue) * 255);
  const blue = Math.round((bluePrime + matchValue) * 255);

  return `rgb(${red}, ${green}, ${blue})`;
}

function formatToolName(tool) {
  const names = {
    pen: 'Pen',
    move: 'Move Shape',
    eraser: 'Eraser',
    line: 'Line',
    rect: 'Rectangle',
    roundRect: 'Rounded Rectangle',
    square: 'Square',
    circle: 'Circle',
    oval: 'Oval',
    dome: 'Dome',
  };

  return names[tool] || tool;
}

function findTopShapeAtPoint(x, y, shapes) {
  for (let index = shapes.length - 1; index >= 0; index--) {
    if (shapes[index].tool === 'eraser') {
      continue;
    }

    if (isPointInsideShape(x, y, shapes[index])) {
      return shapes[index];
    }
  }

  return null;
}

function isPointInsideShape(x, y, shape) {
  const offsetX = shape.offsetX || 0;
  const offsetY = shape.offsetY || 0;

  const localX = x - offsetX;
  const localY = y - offsetY;
  const padding = Math.max(shape.strokeWidth + 10, 14);

  const bounds = getShapeBounds(shape);

  if (!bounds) return false;

  if (
    localX < bounds.x - padding ||
    localX > bounds.x + bounds.width + padding ||
    localY < bounds.y - padding ||
    localY > bounds.y + bounds.height + padding
  ) {
    return false;
  }

  if (shape.tool === 'line') {
    const distance = distanceToLineSegment(
      localX,
      localY,
      shape.startX,
      shape.startY,
      shape.endX,
      shape.endY
    );

    return distance <= padding;
  }

  if (shape.tool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(shape.endX - shape.startX, 2) +
        Math.pow(shape.endY - shape.startY, 2)
    );

    const distanceFromCenter = Math.sqrt(
      Math.pow(localX - shape.startX, 2) + Math.pow(localY - shape.startY, 2)
    );

    return distanceFromCenter <= radius + padding;
  }

  if (shape.tool === 'oval') {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const radiusX = bounds.width / 2 + padding;
    const radiusY = bounds.height / 2 + padding;

    if (radiusX === 0 || radiusY === 0) return false;

    const ovalValue =
      Math.pow(localX - centerX, 2) / Math.pow(radiusX, 2) +
      Math.pow(localY - centerY, 2) / Math.pow(radiusY, 2);

    return ovalValue <= 1;
  }

  return true;
}

function getShapeBounds(shape) {
  if ((shape.tool === 'pen' || shape.tool === 'eraser') && shape.bounds) {
    return {
      x: shape.bounds.minX,
      y: shape.bounds.minY,
      width: shape.bounds.maxX - shape.bounds.minX,
      height: shape.bounds.maxY - shape.bounds.minY,
    };
  }

  if (
    shape.tool === 'line' ||
    shape.tool === 'rect' ||
    shape.tool === 'roundRect' ||
    shape.tool === 'oval' ||
    shape.tool === 'dome'
  ) {
    return {
      x: Math.min(shape.startX, shape.endX),
      y: Math.min(shape.startY, shape.endY),
      width: Math.abs(shape.endX - shape.startX),
      height: Math.abs(shape.endY - shape.startY),
    };
  }

  if (shape.tool === 'square') {
    const side = Math.min(
      Math.abs(shape.endX - shape.startX),
      Math.abs(shape.endY - shape.startY)
    );

    return {
      x: shape.endX < shape.startX ? shape.startX - side : shape.startX,
      y: shape.endY < shape.startY ? shape.startY - side : shape.startY,
      width: side,
      height: side,
    };
  }

  if (shape.tool === 'circle') {
    const radius = Math.sqrt(
      Math.pow(shape.endX - shape.startX, 2) +
        Math.pow(shape.endY - shape.startY, 2)
    );

    return {
      x: shape.startX - radius,
      y: shape.startY - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  return null;
}

function distanceToLineSegment(pointX, pointY, startX, startY, endX, endY) {
  const lineLengthSquared =
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2);

  if (lineLengthSquared === 0) {
    return Math.sqrt(
      Math.pow(pointX - startX, 2) + Math.pow(pointY - startY, 2)
    );
  }

  let amount =
    ((pointX - startX) * (endX - startX) +
      (pointY - startY) * (endY - startY)) /
    lineLengthSquared;

  amount = Math.max(0, Math.min(1, amount));

  const closestX = startX + amount * (endX - startX);
  const closestY = startY + amount * (endY - startY);

  return Math.sqrt(
    Math.pow(pointX - closestX, 2) + Math.pow(pointY - closestY, 2)
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },

  topToolbar: {
    backgroundColor: '#F5F5F5',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CFCFCF',
  },

  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 11,
    color: '#555555',
    marginBottom: 8,
    fontWeight: '600',
  },

  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    flex: 1,
  },

  sectionWide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    flex: 1.8,
  },

  label: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },

  colorWheelWrapper: {
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },

  pickerCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },

  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  colorButton: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },

  colorPreview: {
    height: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    marginTop: 7,
  },

  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  toolButton: {
    width: 48,
    height: 43,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  activeTool: {
    backgroundColor: ANDROID_GREEN,
    borderColor: '#111111',
  },

  toolIcon: {
    fontSize: 19,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  toolLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },

  fillButton: {
    marginTop: 6,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  fillText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },

  sizeButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },

  sizeButton: {
    width: 42,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },

  sizeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  strokePreviewBox: {
    height: 30,
    justifyContent: 'center',
  },

  strokePreview: {
    width: '100%',
  },

  canvasWrapper: {
    flex: 1,
    padding: 10,
  },

  canvas: {
    flex: 1,
    backgroundColor: CANVAS_BACKGROUND,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CFCFCF',
    overflow: 'hidden',
  },

  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#CFCFCF',
  },

  bottomButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  activeBottomButton: {
    backgroundColor: ANDROID_GREEN,
    borderColor: '#111111',
  },

  bottomText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
