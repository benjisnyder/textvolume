// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 320, height: 300});

let rectStyle = {
  color : {r: 1, g: 0, b: 0},
  opacity : 0.5
};

function calculateManualRects(targetNode) {
  let rectChildren = targetNode.findChildren(node => node.type === "RECTANGLE");
  let data = {percent : '0', value : 0};
  let frameArea = targetNode.width*targetNode.height;
  let textArea = 0;

  rectChildren.forEach(r => {
    if (JSON.stringify(r.fills[0].color) === JSON.stringify(rectStyle.color) && r.fills[0].opacity === rectStyle.opacity) {
      textArea += r.width*r.height;
    }
  });

  data.value = (textArea/frameArea) * 100;
  data.percent = data.value.toFixed() + '%';
  figma.ui.postMessage({data});
}

function autoDetectAndRender(targetNode) {
  let textNodeChildren = targetNode.findChildren(node => node.type === "TEXT");

  textNodeChildren.forEach(child => {
      const rect = figma.createRectangle();
      rect.x = child.x;
      rect.y = child.y;
      rect.strokeWeight = 8;
      rect.fills = [{
        type: 'SOLID', color: rectStyle.color, opacity : rectStyle.opacity
      }];

      targetNode.appendChild(rect);
      rect.resize(child.width, child.height);
  });
}

figma.ui.onmessage = message => {
  let selection = figma.currentPage.selection;

  selection.forEach(node => {
    if (node.type === "FRAME") { // need to have a frame selected
      if (message.type === 'detect') {
        autoDetectAndRender(node);  
      }
      calculateManualRects(node);
    }
  });
};
