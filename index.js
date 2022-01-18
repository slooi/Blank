// Setup HTML
// Create Element
var inputEl = document.createElement("input");
inputEl.style.position = "fixed";
inputEl.style.display = "none";
document.body.append(inputEl);

//###########################
// Setup Variables
//###########################
var mode = "normal";
var node;
var str1;
var str2;

// Hotkeys like 'c', 'x', 'd' should not trigger when a special key is being pressed at the same time. As when don't want the 'c' hotkey to trigger during a 'ctrl' + 'c'.
//Thus we track the keysDown. However, if we alt tab out then go back in, this program will still think that alt is down. Thus we add a keysDowntime(r)
const keysDown = {
	Shift: false,
	Control: false,
	Alt: false,
};

const keysDownTime = {
	Shift: 0,
	Control: 0,
	Alt: 0,
};

const keys = Object.keys(keysDown);

const mousePos = {
	x: 0,
	y: 0,
};

//###########################
// CLASSES
//###########################

// Handles everything to do with selections
class SelectionHandler {
	constructor() {
		this.node;
	}
	getSelectionInfo() {
		/* 
			// RETURNS [
				leftOffset, 
				rightOffset, 
				lengthOfSelected(excluding non visible characters like \n),
				string that was selected
			]
		*/

		// Get selection
		var selection = window.getSelection();

		// Get selection related variables
		var leftOff =
			selection.anchorOffset < selection.extentOffset
				? selection.anchorOffset
				: selection.extentOffset;
		var rightOff =
			selection.extentOffset > selection.anchorOffset
				? selection.extentOffset
				: selection.anchorOffset;
		var len = selection.anchorNode.length;
		var string = selection.anchorNode.textContent;

		// Update node
		this.node = selection.anchorNode;

		// RETURN
		return [leftOff, rightOff, len, string];
	}
	getNode() {
		if (this.node) {
			return this.node;
		} else {
			console.error("this.node is not set!!!");
		}
	}
}

//###########################
// Main Code
//###########################

selectionHandler = new SelectionHandler();

// Handles user keyboard inputs
function keyInputHandler(e, isDown) {
	const key = e.key;
	if (key === "Shift" || key === "Alt" || key === "Control") {
		if (isDown) {
			keysDownTime[key] = new Date();
		} else {
			keysDownTime[key] = -Infinity;
		}
	} else {
		// If the time from the last keydown event is not less than 1000ms then the keyDown should be false
		keys.forEach((keyI) => {
			keysDown[keyI] = new Date() - keysDownTime[keyI] < 1000;
		});
	}
}

// Position and display input field
function positionInputField(x, y, isVisible) {
	inputEl.style.left = x + "px";
	inputEl.style.top = y + "px";
	inputEl.style.display = isVisible ? "inline-block" : "none";
}

//###########################
// Listeners
//###########################
window.addEventListener("keyup", (e) => {
	keyInputHandler(e, false);
});

window.addEventListener("keydown", (e) => {
	keyInputHandler(e, true);
	// If has something selected
	if (window.getSelection().anchorNode.length > 0) {
		// If "c" pressed
		if (e.key === "c") {
			console.log("after c!!!");
			if (
				mode === "normal" &&
				!keysDown.Shift &&
				!keysDown.Control &&
				!keysDown.Alt
			) {
				console.log("I'm inside!");
				mode = "edit";

				positionInputField(mousePos.x, mousePos.y, true);

				// postions
				[leftOff, rightOff, len, string] =
					selectionHandler.getSelectionInfo();

				// Strings
				str1 = string.substring(0, leftOff);
				str2 = string.substring(rightOff, len);
				console.log("str1" + str1);
				console.log("str2" + str2);

				// Focus on the input element, but wait for 100ms to prevent the hotkey from being inputed into the input element
				setTimeout(() => {
					inputEl.focus();
				}, 100);
			}
		}
	}
	if (e.key === "Enter") {
		var newStr = str1 + inputEl.value + str2;
		if (inputEl.value !== "") {
			selectionHandler.getNode().textContent = newStr;
		}

		// reset
		inputEl.value = "";
		mode = "normal";

		inputEl.style.display = "none";
	}
});

window.addEventListener("mousemove", (e) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
});
