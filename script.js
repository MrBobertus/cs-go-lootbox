function createWheelTicker(listElement) {
    let currentItemUnderSelector = null;
    let animationFrameId = null;
    let isTicking = false;
    const selectorElement = document.getElementById("wheel-selector");

    function checkItems() {
        const listItems = listElement.querySelectorAll('.wheel-item');
        if (listItems.length === 0) {
            return;
        }

        const selectorRect = selectorElement.getBoundingClientRect();
        const selectorCenterX = selectorRect.left + selectorRect.width / 2;
        let newItemUnderSelector = null;

        for (const item of listItems) {
            const itemRect = item.getBoundingClientRect();
            if (selectorCenterX >= itemRect.left && selectorCenterX <= itemRect.right) {
                newItemUnderSelector = item;
                break;
            }
        }

        if (newItemUnderSelector && newItemUnderSelector !== currentItemUnderSelector) {
            playAudio("spinning-box-sfx", 5);
            currentItemUnderSelector = newItemUnderSelector;
        } else if (!newItemUnderSelector && currentItemUnderSelector) {
            currentItemUnderSelector = null;
        }

        if (isTicking) {
            animationFrameId = requestAnimationFrame(checkItems);
        }
    }

    return {
        start: function() {
            if (isTicking) return;
            isTicking = true;
            currentItemUnderSelector = null;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(checkItems);
        },
        stop: function() {
            if (!isTicking) return;
            isTicking = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        },
        getCurrentItem: function() {
            return currentItemUnderSelector;
        },
        reset: function() {
            this.stop();
            currentItemUnderSelector = null;
        }
    };
}

let spinning = false;

function playAudio(id, playbackSpeed) {
  id = id.toString();
  let audio = document.getElementById(id);
  audio.playbackRate = playbackSpeed || 1;
  audio.volume = 0.3;
  audio.play();
}

function setRarity() {
  let rarity = Math.floor(Math.random() * 100);
  if (rarity <= 1) {
    return "ancient";
  } else if (rarity < 3) {
    return "legendary";
  } else if (rarity < 12) {
    return "mythical";
  } else if (rarity < 25) {
    return "rare";
  } else if (rarity < 50) {
    return "uncommon";
  }
  return "common";
}

function shuffleArray(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function generateWheel() {
  if (spinning == false) {
    let items = [];
    let visualItems = [];
      let visualItemList = [];
    const text = document.getElementById("text").value;
    const list = document.getElementById("list");

    list.innerHTML = "";

    text.split(",").forEach((item) => {
      let rarity = setRarity();
      items.push({ item, rarity });
    });

    items.forEach((item) => {
      let repetitions = 1;

      switch (item.rarity) {
        case "ancient":
          repetitions = 1;
          break;
        case "legendary":
          repetitions = 2;
          break;
        case "mythical":
          repetitions = 3;
          break;
        case "rare":
          repetitions = 5;
          break;
        case "uncommon":
          repetitions = 7;
          break;
        case "common":
          repetitions = 9;
          break;
      }

      for (let i = 0; i < repetitions; i++) {
        visualItems.push(item);
      }
    });

    while (visualItems.length < 150) {
      visualItems = visualItems.concat(visualItems);
      shuffleArray(visualItems);
    }

    visualItems.forEach((item) => {
        visualItemList.push(`<li class="wheel-item rarity-${item.rarity}">${item.item}</li>`)
    });

    visualItemList = visualItemList.join("")
    list.innerHTML = visualItemList
    list.style.transform = `translateX(48%)`;
  }
}

document.getElementById("text").addEventListener("input", function () {
  generateWheel();
});

function getRandomItem() {
  const list = document.getElementById("list");
  const items = list.querySelectorAll(".wheel-item");
  let randomItem =
    items[Math.floor(Math.random() * ((items.length - 10) - 52 + 1) + 52)];
  return randomItem;
}

function animateWheelToTarget(targetLiElement) {
  if (!targetLiElement) {
    console.error("No target element provided for animation.");
    return;
  }

  const wheelUlElement = document.getElementById("list");
  const wheelContainer = document.getElementById("output-container");

  if (!wheelContainer) {
    console.error(
      "Wheel container not found! Make sure it has an ID like 'wheel-container'."
    );
    return;
  }

  wheelTickerInstance = createWheelTicker(wheelUlElement);

  const containerCenter = wheelContainer.offsetWidth / 2;

  const targetLiCenterWithinUl =
    targetLiElement.offsetLeft + targetLiElement.offsetWidth / 2;

  let targetTranslateX = containerCenter - targetLiCenterWithinUl;
  const targetTranslateXFully = targetTranslateX;
  const maxOffsetPercentage = 0.5;
  const maxPixelOffsetForItem =
    targetLiElement.offsetWidth * maxOffsetPercentage;
  targetTranslateX =
    targetTranslateX +
    Math.random() * (2 * maxPixelOffsetForItem) -
    maxPixelOffsetForItem;

  wheelUlElement.style.transition =
    "transform 30s cubic-bezier(0.12, 0.87, 0.25, 1)";

  wheelUlElement.style.transform = `translateX(${targetTranslateX}px)`;

  wheelTickerInstance.start(); 

  wheelUlElement.addEventListener(
    "transitionend",
    function handleAnimationEnd() {
      wheelUlElement.removeEventListener("transitionend", handleAnimationEnd);
      wheelTickerInstance.stop();

      wheelUlElement.style.transition =
        "transform 1s cubic-bezier(0.12, 0.87, 0.25, 1)";
      wheelUlElement.style.transform = `translateX(${targetTranslateXFully}px)`;
      playAudio("result-box-sfx");
      playAudio(targetLiElement.classList[1].split("-")[1] + "-box-sfx");
      
      setTimeout(function () {
        generateWheel();
      }, 1500);
      spinning = false;
    }
  );
}

document.getElementById("output-container").addEventListener("click", function () {
  if (spinning == false) {
    spinning = true;
      const winningElement = getRandomItem();

      if (winningElement) {
        playAudio("opening-box-sfx");
        animateWheelToTarget(winningElement);
      } else {
        console.log("Could not select a winner (list might be empty).");
      }
  }
});


