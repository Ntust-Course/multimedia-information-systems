// NOTE: color gradients function from https://philmaurer.dev/projects/js-color-gradients/
// only helps me to create a gradient color by given "start" and "end" color quickly!
const jsgradient = {
  inputA: "",
  inputB: "",
  inputC: "",
  gradientElement: "",

  // Convert a hex color to an RGB array e.g. [r,g,b]
  // Accepts the following formats: FFF, FFFFFF, #FFF, #FFFFFF
  hexToRgb: function (hex) {
    var r, g, b, parts;
    // Remove the hash if given
    hex = hex.replace("#", "");
    // If invalid code given return white
    if (hex.length !== 3 && hex.length !== 6) {
      return [255, 255, 255];
    }
    // Double up charaters if only three suplied
    if (hex.length == 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    // Convert to [r,g,b] array
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);

    return [r, g, b];
  },

  // Converts an RGB color array e.g. [255,255,255] into a hexidecimal color value e.g. 'FFFFFF'
  rgbToHex: function (color) {
    // Set boundries of upper 255 and lower 0
    color[0] = color[0] > 255 ? 255 : color[0] < 0 ? 0 : color[0];
    color[1] = color[1] > 255 ? 255 : color[1] < 0 ? 0 : color[1];
    color[2] = color[2] > 255 ? 255 : color[2] < 0 ? 0 : color[2];

    return (
      this.zeroFill(color[0].toString(16), 2) +
      this.zeroFill(color[1].toString(16), 2) +
      this.zeroFill(color[2].toString(16), 2)
    );
  },

  // Pads a number with specified number of leading zeroes
  zeroFill: function (number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
    }
    return number;
  },

  // Generates an array of color values in sequence from 'colorA' to 'colorB' using the specified number of steps
  generateGradient: function (colorA, colorB, steps) {
    var result = [],
      rInterval,
      gInterval,
      bInterval;

    colorA = this.hexToRgb(colorA); // [r,g,b]
    colorB = this.hexToRgb(colorB); // [r,g,b]
    steps -= 1; // Reduce the steps by one because we're including the first item manually

    // Calculate the intervals for each color
    rStep =
      (Math.max(colorA[0], colorB[0]) - Math.min(colorA[0], colorB[0])) / steps;
    gStep =
      (Math.max(colorA[1], colorB[1]) - Math.min(colorA[1], colorB[1])) / steps;
    bStep =
      (Math.max(colorA[2], colorB[2]) - Math.min(colorA[2], colorB[2])) / steps;

    result.push("#" + this.rgbToHex(colorA));

    // Set the starting value as the first color value
    var rVal = colorA[0],
      gVal = colorA[1],
      bVal = colorA[2];

    // Loop over the steps-1 because we're includeing the last value manually to ensure it's accurate
    for (var i = 0; i < steps - 1; i++) {
      // If the first value is lower than the last - increment up otherwise increment down
      rVal =
        colorA[0] < colorB[0]
          ? rVal + Math.round(rStep)
          : rVal - Math.round(rStep);
      gVal =
        colorA[1] < colorB[1]
          ? gVal + Math.round(gStep)
          : gVal - Math.round(gStep);
      bVal =
        colorA[2] < colorB[2]
          ? bVal + Math.round(bStep)
          : bVal - Math.round(bStep);
      result.push("#" + this.rgbToHex([rVal, gVal, bVal]));
    }

    result.push("#" + this.rgbToHex(colorB));

    return result;
  },
};

const canvas = document.getElementById("part2");
const ctx = canvas.getContext("2d");
const w = canvas.width,
  h = canvas.height;
const x = canvas.width / 2,
  y = canvas.height / 2 + 100;

const UP = {
  width: 12,
  widthDecay: -1,
  heightDecay: 3 / 4,
  angle: 0,
  rotateAngle: 30,
  fullHeight: 400,
  currentLevel: 1,
  isUp: true,
};
const DOWN = {
  width: 7,
  widthDecay: -1,
  height: 40, // NOTE: In original question used 80, but 凱呈 changed it to 40.
  heightDecay: 3 / 4,
  angle: 180,
  rotateAngle: 45,
  currentLevel: 1,
  currentAngle: 180,
  isUp: false,
  startLevel: 6, // down tree starts from 7 => 7 - 6 = 1
};
const COLORS = {
  // darken to ligten
  pinks: jsgradient.generateGradient("#8000ff", "#ff0000", 15),
  // lighten to darken
  browns: jsgradient.generateGradient("#2c1600", "#FFFFFF", 15),
};

// S_n = a * (1 - r^n) / 1-r
// Follow Geometric_progression on wiki
const getA = (r, n, sn) => (sn * (1 - r)) / (1 - r ** n);

const drawTree = (startX, startY, tree) => {
  // when goes down only grows downward or horizontally
  if (!tree.isUp && (tree.currentAngle < 90 || tree.currentAngle > 270)) {
    return;
  }

  ctx.lineWidth = tree.width;

  ctx.beginPath();
  ctx.save();

  if (tree.isUp) {
    // The height of the branch < 40 pixels : pink tone (representing leaves)
    // others : brown tone (representing roots)
    if (tree.height < 40) {
      ctx.strokeStyle = COLORS.pinks[tree.currentLevel - 5];
    } else {
      ctx.strokeStyle =
        COLORS.browns[COLORS.browns.length - tree.currentLevel - 5];
    }
  } else {
    ctx.strokeStyle =
      COLORS.browns[COLORS.browns.length - tree.currentLevel - DOWN.startLevel];
  }

  ctx.translate(startX, startY);
  ctx.rotate((tree.angle * Math.PI) / 180);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -tree.height);
  ctx.stroke();

  if (tree.currentLevel >= tree.endLevel) {
    ctx.restore();
    return;
  }
  tree.currentLevel += 1;

  let height = tree.height;
  // pass to next branch
  if (tree.isUp) {
    tree.height *=
      tree.heightDecay / Math.cos((tree.rotateAngle * Math.PI) / 180);
  } else {
    tree.height *= tree.heightDecay;
    // length of odd and even level are different
    // due to their difference in ratio refers to height but not length
    if (tree.currentLevel % 2 == 1) {
      tree.height /= Math.sin((45 * Math.PI) / 180);
    } else {
      tree.height *= Math.sin((45 * Math.PI) / 180);
    }
  }
  tree.width = tree.width + tree.widthDecay;

  // left
  drawTree(0, -height, {
    ...tree,
    angle: -tree.rotateAngle,
    currentAngle: tree.currentAngle - tree.rotateAngle,
  });
  // right
  drawTree(0, -height, {
    ...tree,
    angle: tree.rotateAngle,
    currentAngle: tree.currentAngle + tree.rotateAngle,
  });
  ctx.restore();
};

const drawAll = (level) => {
  ctx.clearRect(0, 0, w, h);

  let up = JSON.parse(JSON.stringify(UP));
  up.height = getA(
    up.heightDecay / Math.cos((up.rotateAngle * Math.PI) / 180),
    level,
    up.fullHeight
  );
  up.endLevel = level;
  drawTree(x, y, up, true);

  if (level - DOWN.startLevel > 0) {
    let down = JSON.parse(JSON.stringify(DOWN));
    down.endLevel = level - DOWN.startLevel;
    // NOTE: Why I seperate down tree to 2 parts
    // that is becuase I want the behaviors of them as same as up tree
    // first level of length of down tree is `length / sin(45°)`
    down.height /= Math.sin((45 * Math.PI) / 180);
    // left
    drawTree(x, y, {
      ...down,
      angle: down.angle + down.rotateAngle,
      currentAngle: down.angle + down.rotateAngle,
    });
    // right
    drawTree(x, y, {
      ...down,
      angle: down.angle - down.rotateAngle,
      currentAngle: down.angle - down.rotateAngle,
    });
  }
};
