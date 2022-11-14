import 'figma-plugin-ds/dist/figma-plugin-ds.css'

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {themeColors: true, width: 240, height: 312 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if (msg.type === 'spacer-input') {


    // get the new folder name from the user
    const input = msg.spacerInput;

    //function to get folder name suffix
    const getNameParts = (name: string) => {
    const nameParts = name.split('/').filter((part: string) => !!part)
    return nameParts.map((part: string) => part.trim())
    }
    const getNameSuffix = (name: string): string => {
    const pathParts = getNameParts(name)
    pathParts.shift()
    return pathParts[0]
    }

    //function to add folder as a prefix
    const addFolder = (name: string): string => {
    const pathParts = getNameParts(name)
    pathParts.unshift(input)
    return pathParts.join('/')
    }

    if (figma.currentPage.selection.length === 0) {
      return; //nothing is selected
    }

    //Skip over invisible nodes and their descendants inside instances for faster performance
    figma.skipInvisibleInstanceChildren = true

    //Gets all selected instance and text nodes
    // @ts-ignore 
    const components = figma.currentPage.selection[0].findAllWithCriteria({
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

    // loop through text nodes
    for (let text of textNodes){
      if (text.textStyleId){
        // for each text node, get the full name
        const fullName = (figma.getStyleById(text.textStyleId) as TextStyle).name;
        // discard the folder portion and keep the name
        const styleName = getNameSuffix(fullName);
        // using the new folder name from the user, create a string in the form of folder/name
        const newGroup = addFolder(styleName);
        // get all local styles in document
        const allStyles = figma.getLocalTextStyles()
        // search through styles to find one that matches newGroup name
        const matchingStyle = allStyles.find(style => style.name === newGroup)
        // change id of text node to matchingStyle id
        text.textStyleId = matchingStyle?.id
      }
    }
    //Finds all nodes in spacerNodes array with the name ~spacer and changes the Variant Property
    for (const spacer of spacerNodes) {
      spacer.setProperties({"Comp":input})
    }
  }


  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};
