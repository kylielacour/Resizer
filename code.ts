// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {themeColors: true, width: 240, height: 312 });

function getSavedSizes() {
  let savedSizes = figma.root.getPluginData("savedSizes");
  return savedSizes.length > 0 ? JSON.parse(savedSizes) : [];
}

function populate() {

  let savedSizes = getSavedSizes();

  let html = "";
  for (const savedSize of savedSizes) {
    html += `
    <div class="sizeRow flex flex-no-shrink align-items-center pl-xxsmall pr-xxxsmall">
        <div class="sizeiconcontainer" dir="auto">
          <span role="button" tabindex="-1" class="svg-container sizeicon" aria-label="Add">
            <svg class="svg" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.0012 21.4995C10.725 21.4995 10.5012 21.2757 10.5012 20.9995L10.5012 15.9995C10.5012 15.9995 10.725 15.9995 11.0012 15.9995C11.2773 15.9995 11.5012 15.9995 11.5012 15.9995L11.5012 19.7924L19.7916 11.502L15.9987 11.502C15.9987 11.502 15.9987 11.2781 15.9987 11.002C15.9987 10.7258 15.9987 10.502 15.9987 10.502L20.9987 10.502C21.2749 10.502 21.4987 10.7258 21.4987 11.002L21.4987 16.002C21.4987 16.002 21.2749 16.002 20.9987 16.002C20.7226 16.002 20.4987 16.002 20.4987 16.002L20.4987 12.2091L12.2083 20.4995L16.0012 20.4995C16.0012 20.4995 16.0012 20.7234 16.0012 20.9995C16.0012 21.2757 16.0012 21.4995 16.0012 21.4995L11.0012 21.4995Z" fill="black"/></svg>
          </span>
        </div>
        <div id="sizeValue" class="name flex-grow pr-xsmall">${savedSize}</div>
        <div class="sizeiconcontainer delete" dir="auto">
          <button tabindex="-1" class="deletebutton svg-container sizeicon" aria-label="Add" data-size="${savedSize}">
            <svg class="svg" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d='M14 18.5v-4h1v4zM17 18.5v-4h1v4z'/><path clip-rule='evenodd' d='M19 10.5a2 2 0 00-2-2h-2a2 2 0 00-2 2h-3v1h1v10a2 2 0 002 2h6a2 2 0 002-2v-10h1v-1zm-4-1a1 1 0 00-1 1h4a1 1 0 00-1-1zm5 2h-8v10a1 1 0 001 1h6a1 1 0 001-1z' fill-rule='evenodd'/></svg>        
          </button>
        </div>
    </div>`
  }
  figma.ui.postMessage({message: html, name: 'size'});
}

populate();

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  if (msg.type === 'size-input') {
    // get the new size input data
    const sizeInput = msg.userInput;
    
    //reading existing sizes
    const savedSizes = getSavedSizes();
    let closenewsizepage = true;

    if (!savedSizes.includes(sizeInput)) {
      //inserting new size
      savedSizes.push(sizeInput);
      const stringSizes = JSON.stringify(savedSizes);
      figma.root.setPluginData("savedSizes", stringSizes)
      populate();
      closenewsizepage = true;
    }
    else {
      closenewsizepage = false;
      figma.notify('Please choose a unique name.', {timeout: 5000, error: true});
    }
    
    figma.ui.postMessage({message: closenewsizepage, name: 'closenewsizepage'});
  }

  if (msg.type === 'delete-size') {
    // get the new size input data
    const selectedSize = msg.userData;
    
    //reading existing sizes
    const savedSizes = getSavedSizes();

    //filter out selected size

    const newSizes = savedSizes.filter((value: any) => {return selectedSize !== value});
    
    const stringSizes = JSON.stringify(newSizes);
    
    figma.root.setPluginData("savedSizes", stringSizes)
    
    populate();
  }

  if (msg.type === 'user-input') {

    // get the new folder name from the user
    const input = msg.userInput;

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
      spacer.setProperties({"Viewport":input})
    }
  }
}