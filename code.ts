figma.showUI(__html__, {
  themeColors: true,
  width: 160,
  height: 210
});

function getPrefix(selection: FrameNode): string {
  const textNode = selection.findChild(node => node.type === 'TEXT') as TextNode;
  if (!textNode) {
    return 'English'; // Default prefix if no text node found
  }
  const textStyle = figma.getStyleById(textNode.textStyleId as string) as TextStyle;
  if (!textStyle) {
    return 'English'; // Default prefix if no text style found
  }
  const styleName = textStyle.name;
  const separatorIndex = styleName.indexOf('/');
  if (separatorIndex === -1) {
    return 'English'; // Default prefix if separator not found
  }
  return styleName.substring(0, separatorIndex).trim();
}

function swapTextStyles(selectedLanguage: string) {
  console.log('Selected language:', selectedLanguage);

  const selection = figma.currentPage.selection;

  if (selection.length === 0 || selection[0].type !== 'FRAME') {
    figma.ui.postMessage({ type: 'error', message: 'No frame selected' });
    return;
  }

  const selectedFrame = selection[0];
  console.log('Selected Frame Name:', selectedFrame.name);

  let identifiedTextStyles: TextStyle[] = [];
  const prefix = getPrefix(selectedFrame);
  console.log('Prefix:', prefix);

  selectedFrame.findAll(node => {
    if (node.type === 'TEXT') {
      if (typeof node.textStyleId === 'string') {
        const textStyle = figma.getStyleById(node.textStyleId) as TextStyle;
        console.log('Text Style:', textStyle);
        if (textStyle && textStyle.name.startsWith(prefix)) {
          console.log('Style matched prefix');
          const styleNameWithoutPrefix = textStyle.name.slice(prefix.length + 1);
          console.log('Style Name Without Prefix:', styleNameWithoutPrefix);
          const newStyleName = `${selectedLanguage}/${styleNameWithoutPrefix}`;
          console.log('New Style Name:', newStyleName);
          const newStyle = figma.getLocalTextStyles().find(style => style.name === newStyleName);
          if (newStyle) {
            node.textStyleId = newStyle.id;
            console.log('Applied style:', newStyleName);
          } else {
            console.warn('Style not found:', newStyleName);
          }
        }
      }
    }
    return true;
  });

  console.log('Identified Text Styles:', identifiedTextStyles);
}

figma.ui.onmessage = msg => {
  console.log('Received message from UI:', msg);

  if (msg.type === 'swapTextStyles') {
    swapTextStyles(msg.language);
  }
};