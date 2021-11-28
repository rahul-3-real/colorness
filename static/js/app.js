// Variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate-btn");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(".color h4");
const adjustBtns = document.querySelectorAll(".adjust");
const adjustCloseBtns = document.querySelectorAll(".options .close");
const adjustSliders = document.querySelectorAll(".color .options");
const lockBtns = document.querySelectorAll(".lock");
const saveBtn = document.querySelector(".save-btn");
const saveModal = document.querySelector(".save-modal");
const saveInput = document.querySelector(".palette-name");
const saveSubmit = document.querySelector(".save-palette");
const closeSave = document.querySelector(".close-save-modal");
const libraryModal = document.querySelector(".library-modal");
const paletteSelect = document.querySelector(".palette-select");
const libraryBtn = document.querySelector(".library-btn");
const closeLibrary = document.querySelector(".close-library-modal");

let initialColors;
let savedPalettes = [];

// Functions
const generateHex = () => {
  const hexColor = chroma.random();
  return hexColor;
};

const checkTextContrast = (color, text) => {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "#023047";
  } else {
    text.style.color = "#ffffff";
  }
};

const colorizeSliders = (colorEl, hue, brightess, saturation) => {
  const noSat = colorEl.set("hsl.s", 0);
  const fullSat = colorEl.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, colorEl, fullSat]);

  const midBright = colorEl.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["#000000", midBright, "#ffffff"]);

  saturation.style.background = `
    linear-gradient(
      to right, 
      ${scaleSat(0)}, 
      ${scaleSat(1)})
  `;
  brightess.style.background = `
    linear-gradient(
      to right, 
      ${scaleBright(0)}, 
      ${scaleBright(0.5)},
      ${scaleBright(1)})
  `;
  hue.style.background = `
    linear-gradient(
      to right, 
      rgb(204, 75, 75), 
      rgb(204, 204, 75), 
      rgb(75, 204, 75), 
      rgb(75, 204, 204), 
      rgb(75, 75, 204), 
      rgb(204, 75, 204), 
      rgb(204, 75, 75))
  `;
};

const resetInput = () => {
  const inputs = document.querySelectorAll(`input[type="range"]`);
  inputs.forEach((input) => {
    if (input.name === "hue") {
      const hueClr = initialColors[input.getAttribute("data-hue")];
      const hueValue = chroma(hueClr).hsl()[0];
      input.value = Math.floor(hueValue);
    }
    if (input.name === "saturation") {
      const saltClr = initialColors[input.getAttribute("data-saturn")];
      const satValue = chroma(saltClr).hsl()[1];
      input.value = Math.floor(satValue * 100) / 100;
    }
    if (input.name === "brightness") {
      const brightClr = initialColors[input.getAttribute("data-bright")];
      const brightValue = chroma(brightClr).hsl()[2];
      input.value = Math.floor(brightValue * 100) / 100;
    }
  });
};

const hslControls = (e) => {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-saturn") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll(`input[type="range"]`);

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.background = color;
  colorizeSliders(color, hue, brightness, saturation);
};

const randomColors = () => {
  initialColors = [];
  colorDivs.forEach((color, id) => {
    const hexText = color.children[0];
    const randomClr = generateHex();

    if (color.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomClr).hex());
    }

    hexText.textContent = randomClr;
    color.style.background = randomClr;

    checkTextContrast(randomClr, hexText);

    const colorEl = chroma(randomClr);
    const sliders = color.querySelectorAll(".color .options .group input");
    const hue = sliders[0];
    const brightess = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(colorEl, hue, brightess, saturation);
  });

  resetInput();
};

const updateTextUI = (index) => {
  const activeEl = colorDivs[index];
  const txtClr = chroma(activeEl.style.background);
  const textHex = activeEl.querySelector("h4");
  textHex.innerText = txtClr.hex();
  checkTextContrast(txtClr, textHex);
};

const copyToClipboard = (hex) => {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const copyModal = document.querySelector(".copy-modal");
  copyModal.classList.add("active");
  copyModal.addEventListener("transitionend", () => {
    copyModal.classList.remove("active");
  });
};

const openAdjustPanel = (id) => {
  adjustSliders[id].classList.toggle("active");
};

const closeAdjustPanel = (id) => {
  adjustSliders[id].classList.remove("active");
};

const lockColor = (e, id) => {
  const lockIcon = e.target.children[0];
  const activeBtnIcon = colorDivs[id];
  activeBtnIcon.classList.toggle("locked");

  if (lockIcon.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fal fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fal fa-lock-open"></i>';
  }
};

const saveToLocal = (paletteObj) => {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
};

const openSaveModal = () => {
  saveModal.classList.add("active");
};

const closeSaveModal = () => {
  saveModal.classList.remove("active");
};

const openLibraryModal = () => {
  libraryModal.classList.add("active");
};

const closeLibraryModal = () => {
  libraryModal.classList.remove("active");
};

const savePalette = () => {
  saveModal.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteNum;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNum = paletteObjects.length;
  } else {
    paletteNum = savedPalettes.length;
  }

  const paletteObj = {
    name,
    colors,
    num: paletteNum,
  };
  savedPalettes.push(paletteObj);
  saveToLocal(paletteObj);
  saveInput.value = "";

  const paletteEl = document.createElement("div");
  paletteEl.classList.add("box");
  const paletteName = document.createElement("h6");
  paletteName.innerText = paletteObj.name;
  const palettePreview = document.createElement("div");
  palettePreview.classList.add("preview");
  paletteObj.colors.forEach((color) => {
    const prewDiv = document.createElement("div");
    prewDiv.classList.add("item");
    prewDiv.style.background = color;
    palettePreview.appendChild(prewDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette");
  paletteBtn.classList.add(paletteObj.num);
  paletteBtn.innerHTML = `<i class="fal fa-hand-pointer"></i>`;

  paletteBtn.addEventListener("click", (e) => {
    closeLibraryModal();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });

  palettePreview.appendChild(paletteBtn);
  paletteEl.appendChild(paletteName);
  paletteEl.appendChild(palettePreview);

  paletteSelect.appendChild(paletteEl);
};

const getLocalPalette = () => {
  if (localStorage.getItem("palettes") === null) {
    let localPalettes = [];
  } else {
    const paletteObjs = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjs];

    paletteObjs.forEach((paletteObj) => {
      const paletteEl = document.createElement("div");
      paletteEl.classList.add("box");
      const paletteName = document.createElement("h6");
      paletteName.innerText = paletteObj.name;
      const palettePreview = document.createElement("div");
      palettePreview.classList.add("preview");
      paletteObj.colors.forEach((color) => {
        const prewDiv = document.createElement("div");
        prewDiv.classList.add("item");
        prewDiv.style.background = color;
        palettePreview.appendChild(prewDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette");
      paletteBtn.classList.add(paletteObj.num);
      paletteBtn.innerHTML = `<i class="fal fa-hand-pointer"></i>`;

      paletteBtn.addEventListener("click", (e) => {
        closeLibraryModal();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjs[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });

      palettePreview.appendChild(paletteBtn);
      paletteEl.appendChild(paletteName);
      paletteEl.appendChild(palettePreview);

      paletteSelect.appendChild(paletteEl);
    });
  }
};

// Events
getLocalPalette();
randomColors();

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((element, index) => {
  element.addEventListener("input", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

adjustBtns.forEach((btn, id) => {
  btn.addEventListener("click", () => {
    openAdjustPanel(id);
  });
});

adjustCloseBtns.forEach((btn, id) => {
  btn.addEventListener("click", () => {
    closeAdjustPanel(id);
  });
});

lockBtns.forEach((btn, id) => {
  btn.addEventListener("click", (e) => {
    lockColor(e, id);
  });
});

saveBtn.addEventListener("click", openSaveModal);
closeSave.addEventListener("click", closeSaveModal);
saveSubmit.addEventListener("click", savePalette);

libraryBtn.addEventListener("click", openLibraryModal);
closeLibrary.addEventListener("click", closeLibraryModal);

generateBtn.addEventListener("click", randomColors);
