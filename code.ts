// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
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

    //Skip over invisible nodes and their descendants inside instances for faster performance
    figma.skipInvisibleInstanceChildren = true

    //Gets all instance nodes
    const components = figma.root.findAllWithCriteria({
      types: ['INSTANCE', 'TEXT']
    })

    //Allan Question: How do I use the type filtering in the code below?
    //Allan Question: Can we do spacers and type together and sort into 2 arrays in a better way than I did it?

    //GETS ALL SELECTED NODES & THEIR CHILDREN
  
    //create arrays to store spacer and text nodes
    const allNodes = []
    const spacerNodes = []
    const textNodes = []

    //gets all parent nodes from current selection
    const parentNodes = figma.currentPage.selection;
    //single out 1 parentNode of current selection
    for (const parentNode of parentNodes) {
      //send it to allNodes array
      allNodes.push(parentNode)
      //check if there are children
      if ("children" in parentNode) {
        //if so, get all children of parentNode
        const childNodes = parentNode.findAll();
        //single out 1 childNode of current selection
        for (const childNode of childNodes) {
          //send it to allNodes array
          allNodes.push(childNode)
        }
      }   
    }

    //sorts nodes between spacer and text arrays
    //Allan Question: Do we need an else?
    for (const node of allNodes) {
      if (node.type === 'INSTANCE') {
        spacerNodes.push(node)
      }
      if (node.type === 'TEXT') {
        textNodes.push(node)
      }
    }

    //Finds all nodes in spacerNodes array with the name ~spacer and changes the Variant Property
    for (const spacer of spacerNodes) {
    if (spacer.removed === false && spacer.name.includes("~spacer") && (spacer.variantProperties)) {
      spacer.setProperties({"Comp":"userselection"})
      //Allan Question: How to reference user-selected UI here?
      }
    }

    //Finds all nodes in textNodes array
    for (const text of textNodes) {
      //checks if each node has a text style applied
      if (text.removed === false && text.textStyleId === '') {
        //if so, apply user-selected text style
        text.
        }
      }
  

    //GETS ALL TEXT STYLES
    
      // gets all Paint Style from the figma document
      const textStyles = figma.getLocalTextStyles();
      // filters in only text styles in folders
      const filteredTextStyles = textStyles.filter(style => style.name.includes('/'));
     
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
      
      // ehh?
      const folderNames = []

    

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
