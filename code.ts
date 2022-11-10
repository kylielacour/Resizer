// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

//function to get folder name prefix
const getNameParts = (name: string) => {
  const nameParts = name.split('/').filter((part: string) => !!part)
  return nameParts.map((part: string) => part.trim())
}
const getNamePrefix = (name: string): string => {
  const pathParts = getNameParts(name)
  pathParts.pop()
  return pathParts.join('/')
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if (msg.type === 'spacer-input') {

    //Skip over invisible nodes and their descendants inside instances for faster performance
    figma.skipInvisibleInstanceChildren = true

    //Gets all instance and text nodes
    const components = figma.currentPage.findAllWithCriteria({
      types: ['INSTANCE', 'TEXT']
    })

    //create arrays to store spacer and text nodes
    const spacerNodes = []
    const textNodes = []

    //sorts nodes between spacer and text
    //makes sure all instance nodes are spacers
    for (const node of components) {
      if (node.type === 'INSTANCE' && node.removed === false && node.name.includes("~spacer") && (node.variantProperties)) {
        spacerNodes.push(node)
      }
      if (node.type === 'TEXT') {
        textNodes.push(node)
      }
    }

    // get the new folder name from the user
    const input = msg.spacerInput; // 768

    // loop through text nodes
    // for each text node, get the full name
    // discard the folder portion and keep the name
    // using the new folder name from the user, create a string in the form of folder/name
    // assign it to the node

    //Finds all nodes in spacerNodes array with the name ~spacer and changes the Variant Property
    for (const spacer of spacerNodes) {
      spacer.setProperties({"Comp":input})
    }

  }

  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }


  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
