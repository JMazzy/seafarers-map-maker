/*
Catan Board generator
Generates random, playable boards for the board game Catan with the Seafarers expansion.
*/

//Get context linked to canvas element
var c = document.getElementById("mycanvas");
var ctx = c.getContext("2d");

var width = c.width;
var height = c.height;

//---------PROGRAM INITIALIZATION FUNCTIONS----------//
//Define constants
var colorWater = "#009fdf"
var colorBrick = "#b46732";
var colorOre = "#656570";
var colorSheep = "#6da446";
var colorWheat = "#f9c246";
var colorWood = "#2b4e1b";
var colorGold = "#b6a142";
var colorDesert = "#d9b672";
var colorNeutral = "#F4DF95"

var hexHeight = 64;
var hexWidth = 0.866 * hexHeight;

var hexRows = 9; //Math.floor(height / hexHeight);
var hexColumns = 12; //Math.floor(width / hexWidth);

var vertexRows = hexRows - 1;
var vertexColumns = 2 * ( hexColumns - 1 );

var pathRows = vertexRows;
var pathColumns = vertexColumns * 3 / 2 - 1;

var numHex = hexRows * hexColumns;

var kinds = [
  "water",
  "sheep",
  "wheat",
  "wood",
  "brick",
  "ore",
  "gold",
  "desert",
  "blank",
  "frame"
];

//array of counting variables for hexes
var hexCount = [
  27, //water
  7, //sheep
  7, //wheat
  7, //wood
  5, //brick
  5, //ore
  3, //gold
  3, //desert
  0, //empty; placeholder to match kinds array
  0 //frame pieces; placeholder to match kinds array
];

//counting variable array for number tokens
var numberCount = [
  0, //0s
  0, //1s
  1, //2s
  4, //3s
  4, //4s
  5, //5s
  5, //6s
  0, //7s
  5, //8s
  5, //9s
  4, //10s
  4, //11s
  1, //12s
]

//the kinds of ports - same indices as port count
var portKinds = [
  "blank",
  "3:1",
  "2:1sheep",
  "2:1wheat",
  "2:1wood",
  "2:1brick",
  "2:1ore"
]

//counting variable array for port tokens
var totalPortCount = 10;
var portCount = [
  0, //no port
  5, //3:1 - any
  1, //2:1 - sheep
  1, //2:1 - wheat
  1, //2:1 - wood
  1, //2:1 - brick
  1, //2:1 - ore
]

//array for hexes
var hexes = [];
var vertices = [];
var paths = [];

var pseudorandom = function(seed) {
  //needs pseudorandom seeded generator
}

//--INITIALIZATION FUNCTIONS--//
var init = function() {
  initHexes();
  initVertices();
  initPaths();
}

var initHexes = function() {
  //complete hex array
  for (var i = 0; i < hexColumns; i++) {
    hexes[i] = [];
    for (var j = 0; j < hexRows; j++) {

      var offset;
      var neighbors;
      if (j % 2 != 0) {
        offset = hexWidth / 2;
        neighbors = [
          [i + 1, j - 1],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
          [i - 1, j],
          [i, j - 1]
        ]
      } else {
        offset = 0;
        neighbors = [
          [i, j - 1],
          [i + 1, j],
          [i, j + 1],
          [i - 1, j + 1],
          [i - 1, j],
          [i - 1, j - 1]
        ]
      }

      var x = i * hexWidth + offset;
      var y = j * hexHeight * 0.75;

      var pointArray = [
        [x + hexWidth * 0.5, y],
        [x + hexWidth, y + hexHeight * 0.25],
        [x + hexWidth, y + hexHeight * 0.75],
        [x + hexWidth * 0.5, y + hexHeight],
        [x, y + hexHeight * 0.75],
        [x, y + hexHeight * 0.25]
      ]

      //build frame
      var kind = "blank";
      if (i < 1
        || i == hexColumns - 1
        || j < 1 || j == hexRows - 1
        || i == 1 && (j < 3 || j > 5)
        || i > hexColumns - 4
        && (j < 2 || j > 6) || i > hexColumns - 3
        && j != 4) {
        kind = "frame";
      } else {
        kind = "blank";
      }

      //create hex objects
      hexes[i][j] = {
        column: i,
        row: j,
        x: x,
        y: y,
        points: pointArray,
        neighbors: neighbors,
        kind: kind,
        number: 0,
        port: "blank",
        portOrientation: 0,
        portConnected: false
      };
    }
  }
}

var initVertices = function() {
  for ( var i = 0; i < vertexColumns; i++ ) {
    vertices[i] = [];
    for ( var j = 0; j < vertexRows; j++ ) {
      var connectedHexes;
      var x;
      var y;
      var hexI = Math.round(i/2);
      if ( i % 2 == 0 && j % 2 == 0 ) {
        connectedHexes == [[i,j],[i+1,j],[i,j+1]];
        x = hexes[hexI][j].x + hexWidth;
        y = hexes[hexI][j].y + hexHeight * 0.75;
      }
      else if ( i % 2 == 0 && j % 2 != 0 ) {
        connectedHexes == [[i,j],[i+1,j+1],[i,j+1]];
        x = hexes[hexI][j].x + hexWidth * 0.5;
        y = hexes[hexI][j].y + hexHeight;
      }
      else if ( i % 2 != 0 && j % 2 == 0 ) {
        connectedHexes == [[i,j],[i,j+1],[i-1,j+1]];
        x = hexes[hexI][j].x + hexWidth * 0.5;
        y = hexes[hexI][j].y + hexHeight;
      }
      else if ( i % 2 != 0 && j % 2 != 0 ) {
        connectedHexes == [[i-1,j],[i,j],[i+1,j+1]];
        x = hexes[hexI][j].x;
        y = hexes[hexI][j].y + hexHeight * 0.75;
      }

      vertices[i][j] = {
        column: i,
        row: j,
        x: x,
        y: y,
        connectedHexes: connectedHexes,
        connectedVertices: 0
      };
    }
  }
}

var initPaths = function() {
  var pathIndex = 0;
  for ( var i = 0; i < vertexColumns - 1; i++ ) {
    for ( var j = 0; j < vertexRows; j++ ) {
      var vertex1 = vertices[i][j];
      var vertex2 = vertices[i+1][j];

      var path = {
        vertex1: vertex1,
        vertex2: vertex2
      }

      paths[pathIndex] = path;
      pathIndex++;

      if ( ( j % 2 == 0 && i % 2 == 1 || j % 2 == 1 && i % 2 == 0 ) && j < 7) {
        vertex1 = vertices[i][j];
        vertex2 = vertices[i][j+1];

        var path = {
          vertex1: vertex1,
          vertex2: vertex2
        }

        paths[pathIndex] = path;
        pathIndex++;
      }
    }
  }
}

//--PLACING FUNCTIONS--//
//--Hex placing function--//
var placeHexes = function() {
  //variable to store the number of empty slots remaining
  var numEmpty = 0;

  //loop which places hexes in random slots until all slots are full
  do {
    //generates random integers in the range of the hex rows and columns
    var i = Math.floor(Math.random() * hexColumns);
    var j = Math.floor(Math.random() * hexRows);

    //retrieve the hex corresponding to the random row and column
    var hex = hexes[i][j];

    //check if hex is blank; if so, proceed
    if (hex.kind == "blank") {
      //choose an integer in the range of the number of hex terrain types
      var chooser = Math.floor(Math.random() * 8);

      //make sure there are still hexes available
      if (hexCount[chooser] > 0) {
        //set that hex
        hex.kind = kinds[chooser];
        //decrement number of hexes of that terrain type
        hexCount[chooser]--;
      }
    }

    //set counter to zero before checking for empty slots;
    numEmpty = 0;
    for (var i = 0; i < hexColumns; i++) {
      for (var j = 0; j < hexRows; j++) {
        //retrieve the hex
        hex = hexes[i][j]
        //if a slot is empty, increment counter
        if (hex.kind == "blank") {
          numEmpty++;
        }
      }
    }
  }
  while (numEmpty > 0); //loop until there are no more empty slots to fill
}

//--Number Placing Function--//
var placeNumbers = function() {
  var numEmpty = 0;
  do {
    var i = Math.floor(Math.random() * hexColumns);
    var j = Math.floor(Math.random() * hexRows);

    var hex = hexes[i][j];

    //only place numbers on valid hexes
    if (hex.kind != "water" && hex.kind != "desert" && hex.kind != "frame") {
      //hexes with 0 as their number need a valid number instead
      if (hex.number == 0) {
        var chooser = Math.floor(Math.random() * 13);
        if (numberCount[chooser] > 0) {
          hex.number = chooser;
          numberCount[chooser]--;
        }
      }
    }

    numEmpty = 0;
    for (var i = 0; i < hexColumns; i++) {
      for (var j = 0; j < hexRows; j++) {
        hex = hexes[i][j];
        if (hex.number == 0 && hex.kind != "water" && hex.kind != "desert" && hex.kind != "frame") {
          numEmpty++;
        }
      }
    }
  }
  while (numEmpty > 0);
}

//--Port Placing Function--//
var placePorts = function() {
  if ( totalPortCount > 0 ) {
    do {
      var i = Math.floor(Math.random() * hexColumns);
      var j = Math.floor(Math.random() * hexRows);

      //find this hex from the hex array
      var hex = hexes[i][j];

      //only place ports on valid hexes
      if ( hex.kind == "water" && hex.port == "blank" ) {
        //create and fill neighbor array (for finding port orientation)
        var neighbors = [];
        for (var k = 0; k < 6; k++) {
          neighbors[k] = [];
          neighbors[k][0] = hex.neighbors[k][0]
          neighbors[k][1] = hex.neighbors[k][1]
        }

        //check for neighboring land
        var landNeighbors = 0;
        var portNeighbors = 0;
        for (var k = 0; k < 6; k++) {
          var neighbor = hexes[neighbors[k][0]][neighbors[k][1]];
          if ( ( neighbor.kind != "water" && neighbor.kind != "frame" && neighbor.kind != "desert" ) ) {
            landNeighbors++;
          }
          else if ( neighbor.kind == "water" && neighbor.port != "blank" ) {
            portNeighbors++;
          }
        }

        //only proceed if there are actually land neighbors
        if ( landNeighbors > 0 ) {
          var chooser;
          //keep choosing a new number until reaching a port that exists
          do {
            chooser = Math.floor(Math.random() * 7);
          } while ( portCount[chooser] <= 0 );

          //set port to the chosen port
          if (portCount[chooser] > 0) {
            hex.port = portKinds[chooser];
            portCount[chooser]--;
            totalPortCount--;
            console.log("port " + portKinds[chooser] + " placed on hex " + i + ", " + j)
          } else {
            console.log("no ports of kind " + portKinds[chooser] + " left!")
            break;
          }

          //the orientation of the port
          var orientation;

          //the neighbor in that direction
          var neighbor;

          //keep choosing a direction until a suitable one is found
          do {
            orientation = Math.floor(Math.random() * 6);
            neighbor = hexes[neighbors[orientation][0]][neighbors[orientation][1]];
          } while( neighbor.kind == "water"
          || neighbor.kind == "frame"
          || neighbor.kind == "desert" );

          hex.portOrientation = orientation;

          console.log("port is facing the " + orientation + " direction.");
        }
      }
    } while( totalPortCount > 0 );
  }
}

//--HEX ADJUSTMENT/MAP IMPROVEMENT FUNCTIONS--//
//reduces the number of occurences of neighboring hexes of same type
var unClump = function(iterations) {
  for ( var iter = 0; iter < iterations; iter++ ) {
    for (var i = 0; i < hexColumns; i++) {
      for (var j = 0; j < hexRows; j++) {
        var hex = hexes[i][j];
        var neighbors = [];
        for (var k = 0; k < 6; k++) {
          neighbors[k] = [];
          neighbors[k][0] = hex.neighbors[k][0]
          neighbors[k][1] = hex.neighbors[k][1]
        }

        for (var k = 0; k < 6; k++) {
          if (hex.kind != "frame") {
            var neighbor = hexes[neighbors[k][0]][neighbors[k][1]];
            if (neighbor.kind == hex.kind && neighbor.kind != "water" && neighbor.kind != "frame" && neighbor.kind != "desert") {
              blankOneHex(i, j);
            } else if ( hex.kind == "desert") {
              //blankOneHex(hex.column, hex.row);
            }
          }
        }
      }
    }
    placeHexes();
  }
}

//--Unclump numbers function--//
//Attempts to eliminate neighboring numbers with same value
var unClumpNumbers = function(iterations) {
  for ( var iter = 0; iter < iterations; iter++ ) {
    for (var i = 0; i < hexColumns; i++) {
      for (var j = 0; j < hexRows; j++) {
        var hex = hexes[i][j];
        var neighbors = [];
        for (var k = 0; k < 6; k++) {
          neighbors[k] = [];
          neighbors[k][0] = hex.neighbors[k][0]
          neighbors[k][1] = hex.neighbors[k][1]
        }

        for (var k = 0; k < 6; k++) {
          if (hex.kind != "frame") {
            var neighbor = hexes[neighbors[k][0]][neighbors[k][1]];
            if (neighbor.number == hex.number || hex.number == 6 && neighbor.number == 8 || hex.number == 8 && neighbor.number == 6) {
              zeroOneHex(i, j);
            }
          }
        }
      }
    }
    placeNumbers();
  }
}

//--Islandification Function--//
//Attempts to shift terrain shape into more natural looking islands
//*****************NEEDS WORK***************************//
var islandify = function(iterations) {
  for ( var iter = 0; iter < iterations; iter++ ) {
    for (var i = 0; i < hexColumns; i++) {
      for (var j = 0; j < hexRows; j++) {
        var hex = hexes[i][j];
        var neighbors = [];
        for (var k = 0; k < 6; k++) {
          neighbors[k] = [];
          neighbors[k][0] = hex.neighbors[k][0]
          neighbors[k][1] = hex.neighbors[k][1]
        }

        var landNeighbors = 0;
        var waterNeighbors = 0;
        if (hex.kind != "frame") {
          for (var k = 0; k < 6; k++) {
            var neighbor = hexes[neighbors[k][0]][neighbors[k][1]];
            if (neighbor.kind != "water" && neighbor.kind != "frame") {
              landNeighbors++;
            } else if (neighbor.kind == "water" ) {
              waterNeighbors++;
            }
          }
        }

        //reduces single-hex islands
        if (hex.kind != "water" && hex.kind != "frame"
        && ( waterNeighbors == 6 || landNeighbors == 2 ) ) {
          blankOneHex(i, j);

          // var chooser = Math.floor(Math.random() * 6)
          // var neighbor = hexes[neighbors[chooser][0]][neighbors[chooser][1]];
          // blankOneHex(neighbor.column, neighbor.row);

          //reduces single-hex lakes
        } else if ( landNeighbors == 6 || waterNeighbors == 2 ) {
          blankOneHex(i, j);

          // var chooser = Math.floor(Math.random() * 6)
          // var neighbor = hexes[neighbors[chooser][0]][neighbors[chooser][1]];

          //don't blank frame hexes
          //if ( neighbor.kind == "water") {
          //  blankOneHex(neighbor.column, neighbor.row);
          //}
        }
      }
    }
    placeHexes();
  }
}

//converts one hex into a blank hex and increments hex counter
var blankOneHex = function(x, y) {
  var hex = hexes[x][y];
  for (var i = 0; i < 8; i++) {
    if (hex.kind == kinds[i]) {
      hexCount[i]++;
    }
  }
  hex.kind = "blank";
}

//converts one number tile into a zero and increments number tile counter
var zeroOneHex = function(x, y) {
  var hex = hexes[x][y];
  for (var i = 0; i < 13; i++) {
    if (hex.number == i) {
      numberCount[i]++;
    }
  }
  hex.number = 0;
}

//----------DRAW FUNCTIONS----------//
var draw = function() {
  clearCanvas();
  drawHexes();
  //drawVertices();
  //drawPaths();
}

//clear
var clearCanvas = function() {
  ctx.clearRect(0, 0, mycanvas.width, mycanvas.height);
}

//draws the terrain on the canvas
var drawHexes = function() {
  //render hexes
  for (var i = 0; i < hexColumns; i++) {
    for (var j = 0; j < hexRows; j++) {
      //Path
      var hex = hexes[i][j];

      ctx.beginPath();

      ctx.moveTo(hex.points[0][0], hex.points[0][1]);

      for (var k = 1; k < 6; k++) {
        ctx.lineTo(hex.points[k][0], hex.points[k][1]);
      }

      ctx.closePath();

      ctx.strokeStyle = colorNeutral;

      if (hex.kind != "blank") {
        if (hex.kind == "water") {
          ctx.fillStyle = colorWater;
        } else if (hex.kind == "sheep") {
          ctx.fillStyle = colorSheep;
        } else if (hex.kind == "wheat") {
          ctx.fillStyle = colorWheat;
        } else if (hex.kind == "wood") {
          ctx.fillStyle = colorWood;
        } else if (hex.kind == "brick") {
          ctx.fillStyle = colorBrick;
        } else if (hex.kind == "ore") {
          ctx.fillStyle = colorOre;
        } else if (hex.kind == "gold") {
          ctx.fillStyle = colorGold;
        } else if (hex.kind == "desert") {
          ctx.fillStyle = colorDesert;
        } else if (hex.kind == "frame") {
          ctx.fillStyle = colorWater;
        }

        ctx.fill();

        ctx.lineWidth = 2;

        ctx.stroke();

        if (hex.number != 0) {
          ctx.beginPath();
          ctx.arc(hex.points[0][0], hex.points[0][1] + hexHeight / 2, 10, 0, Math.PI * 2);
          ctx.fillStyle = colorNeutral;
          ctx.fill();

          var numOffset;
          if (hex.number > 9) {
            numOffset = 8;
          } else {
            numOffset = 4;
          }

          ctx.closePath();

          ctx.font = "14px Mono"
          ctx.fillStyle = "#111"
          ctx.fillText(hex.number, hex.points[0][0] - numOffset, hex.points[0][1] + hexHeight / 2 + 5);
        }

        if ( hex.port != "blank" ) {
          ctx.beginPath();

          ctx.moveTo(hex.points[0][0], hex.points[0][1] + hexHeight / 2);

          var port1 = hex.portOrientation;
          var port2 = hex.portOrientation + 1;
          if ( port2 > 5 ) {
            port2 = 0;
          }
          ctx.lineTo(hex.points[port1][0], hex.points[port1][1]);
          ctx.lineTo(hex.points[port2][0], hex.points[port2][1]);

          ctx.closePath();

          ctx.strokeStyle = colorNeutral;
          ctx.stroke();

          ctx.beginPath();

          ctx.arc(hex.points[0][0], hex.points[0][1] + hexHeight / 2, 10, 0, Math.PI * 2);

          ctx.closePath();

          if (hex.port == "3:1") {
            ctx.strokeStyle = colorDesert;
          } else if (hex.port == "2:1sheep") {
            ctx.strokeStyle = colorSheep;
          } else if (hex.port == "2:1wheat") {
            ctx.strokeStyle = colorWheat;
          } else if (hex.port == "2:1wood") {
            ctx.strokeStyle = colorWood;
          } else if (hex.port == "2:1brick") {
            ctx.strokeStyle = colorBrick;
          } else if (hex.port == "2:1ore") {
            ctx.strokeStyle = colorOre;
          }

          ctx.fillStyle = colorNeutral
          ctx.fill();

          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.font = "10px Mono"
          ctx.fillStyle = "#111"
          ctx.fillText(hex.port.substring(0,3), hex.points[0][0] - 9,
          hex.points[0][1] + hexHeight / 2 + 4);
        }
      }
    }
  }
}

var drawVertices = function() {
  //draws markers at the vertices
  for ( var i = 0; i < vertexColumns; i++ ) {
    for ( var j = 0; j < vertexRows; j++ ) {
      ctx.beginPath();
      var vertex = vertices[i][j];
      ctx.arc(vertex.x, vertex.y, 3, 0, Math.PI * 2);

      ctx.closePath();

      ctx.fillStyle = colorNeutral;
      ctx.fill();
    }
  }
}

var drawPaths = function() {
  //draws paths
  for ( var i = 0; i < paths.length; i++ ) {
    ctx.beginPath();
    var path = paths[i];
    ctx.moveTo(path.vertex1.x, path.vertex1.y);
    ctx.lineTo(path.vertex2.x, path.vertex2.y);

    ctx.closePath();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f00";
    ctx.stroke();
  }
}

//----------MAIN LOOP----------//
//This function is called in each animation frame
var mainloop = function() {
  //handle input

  //calculate

  //Draw on screen
  draw();
}

//----------FULL MAIN PROGRAM-----------//
var main = function() {
  // initialize all
  init();

  placeHexes();

  islandify(10);

  unClump(10);

  placeNumbers();

  unClumpNumbers(10);

  placePorts();

  // start the mainloop
  window.setInterval(mainloop, 1000 / 10);
}

//----------EXECUTE MAIN PROGRAM----------//
main();
