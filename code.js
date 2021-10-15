// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 300 });
const rectLabel = "TVDELETE" + Date.now();
const rootNode = figma.root;
let rectStyle = {
    color: { r: 1, g: 0, b: 0 },
    opacity: 0.5
};
function getRects(targetNode) {
    return targetNode.findAll(node => node.type === "RECTANGLE" && node.name === rectLabel);
}
function deleteRects(targetNode) {
    let rectChildren = getRects(targetNode);
    rectChildren.forEach(r => {
        r.remove();
    });
}
function calculateManualRects(targetNode, rectParent) {
    let rectChildren = getRects(rectParent);
    let data = { percent: '0', value: 0 };
    let frameArea = targetNode.width * targetNode.height;
    let textArea = 0;
    rectChildren.forEach(r => {
        if (JSON.stringify(r.fills[0].color) === JSON.stringify(rectStyle.color) && r.fills[0].opacity === rectStyle.opacity) {
            textArea += r.width * r.height;
        }
    });
    data.value = (textArea / frameArea) * 100;
    data.percent = data.value.toFixed() + '%';
    figma.ui.postMessage({ data });
}
function autoDetectAndRender(targetNode) {
    let textNodeChildren = targetNode.findAll(node => node.type === "TEXT");
    textNodeChildren.forEach(child => {
        const rect = figma.createRectangle();
        rect.x = child.absoluteRenderBounds.x;
        rect.y = child.absoluteRenderBounds.y;
        rect.strokeWeight = 8;
        rect.fills = [{
                type: 'SOLID', color: rectStyle.color, opacity: rectStyle.opacity
            }];
        rect.name = rectLabel;
        rect.resize(child.width, child.height);
        /*
        figma.root.appendChild(rect);
  
        Somewhere deep down in Figma's dom painting
        engine there is some magic happening wherein
        figma can detect that we've created these
        rectangles and it adds them to the page
        automatically.
        
        I'm guessing that figma.createRectangle()
        adds those rectangles as children of figma.root
        and calling figma.[node].appendChild(rect) simply
        moves them from that location to [node].children.
  
        Unless this changes, there's no need to manually
        append the rects to the figma page.
        */
    });
}
figma.ui.onmessage = message => {
    let selection = figma.currentPage.selection;
    selection.forEach(node => {
        if (message.type === 'detect') {
            deleteRects(rootNode);
            if (node.type === "FRAME") { // need to have a frame selected
                autoDetectAndRender(node);
            }
            calculateManualRects(node, rootNode);
        }
        if (message.type === 'delete') {
            deleteRects(rootNode);
        }
    });
};
