// Setup HTML

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
	// Can only  have one of this class

	constructor() {
		this.element;
		this.node;
		this.nodeString;

		this.leftOff;
		this.rightOff;
		this.nodeStringLength;
	}
	// Tags currently selected content and stores relevant info for later use
	tagSelected() {
		// Get selection
		var selection = window.getSelection();

		// Get selection related variables
		this.leftOff =
			selection.anchorOffset < selection.extentOffset
				? selection.anchorOffset
				: selection.extentOffset;

		this.rightOff =
			selection.extentOffset > selection.anchorOffset
				? selection.extentOffset
				: selection.anchorOffset;

		this.nodeStringLength = selection.anchorNode.length;

		this.nodeString = selection.anchorNode.textContent; //!@#!@#!@# get rid of, use this.string instead
		// Update node
		this.node = selection.anchorNode;
	}
	replacedTaggedText(string) {
		// Generate new textContent
		const [strLeft, strRight] = this.getAdjacentToSelectedString();
		var newStr = strLeft + string + strRight;

		// Replace old text with new text
		this.getNode().textContent = newStr;
	}
	// User has something selected
	hasSelection() {
		if (window.getSelection().anchorNode === null) {
			return false;
		}
		return window.getSelection().anchorNode.length > 0;
	}
	// returns the selected string
	getSelection() {
		return selectionHandler.nodeString.slice(
			selectionHandler.leftOff,
			selectionHandler.rightOff
		);
	}
	// Highlights currently selected text
	highlight() {
		var textNode = this.node;
		var selection = window.getSelection();
		var range = document.createRange();

		range.selectNodeContents(textNode);
		range.setStart(textNode, this.leftOff);
		range.setEnd(textNode, this.rightOff);

		selection.removeAllRanges();
		selection.addRange(range);
	}

	//#######################
	// HELPER FUNCTIONS
	//#######################
	getAdjacentToSelectedString() {
		return [
			this.nodeString.substring(0, this.leftOff),
			this.nodeString.substring(this.rightOff, this.nodeStringLength),
		];
	}
	getNode() {
		if (this.node) {
			return this.node;
		} else {
			console.error("this.node is not set!!!");
		}
	}
}

//
class TextField {
	constructor() {
		// Create and setup input element
		this.inputEl = document.createElement("input");
		this.inputEl.style.position = "fixed";
		this.setVisibility(false);

		// Append input element to document
		document.body.append(this.inputEl);
	}
	//###########################
	//	SETTERS
	//###########################
	// setPosition
	setPosition(x, y) {
		this.inputEl.style.left = x + "px";
		this.inputEl.style.top = y + "px";
	}
	// setVisibility
	setVisibility(isVisible) {
		this.inputEl.style.display = isVisible ? "inline-block" : "none";
	}
	// setVal
	clearVal() {
		this.inputEl.value = "";
	}
	//###########################
	//	GETTERS
	//###########################
	// getVal
	getVal() {
		return this.inputEl.value;
	}
	//###########################
	//	OTHER
	//###########################
	// focus
	focus() {
		// Focus on the input element, but wait for 100ms to prevent the hotkey from being inputed into the input element
		setTimeout(() => {
			this.inputEl.focus();
		}, 100);
	}
}

//###########################
// Main Code
//###########################

selectionHandler = new SelectionHandler();
textField = new TextField();

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

function specialKeysNotDown() {
	return !keysDown.Shift && !keysDown.Control && !keysDown.Alt;
}

//###
// MODE
//###
function editMode(e) {
	if (e.key === "Enter") {
		const textFieldVal = textField.getVal();

		// If textField has content
		if (textFieldVal !== "") {
			selectionHandler.replacedTaggedText(textFieldVal);

			// Reset textfield
			textField.clearVal();
		}
		textField.setVisibility(false);

		mode = "normal";
	}
}

// Selects mode based off user input
function normalMode(e) {
	// normal
	if (selectionHandler.hasSelection() && specialKeysNotDown()) {
		if (e.key === "c") {
			// If "c" pressed
			mode = "edit";

			textField.setPosition(mousePos.x, mousePos.y);
			textField.setVisibility(true);
			selectionHandler.tagSelected();
			textField.focus();
		} else if (e.key === "d") {
			selectionHandler.tagSelected();
			const selected = selectionHandler.getSelection();
			if (selected.length === 1) {
				selectionHandler.replacedTaggedText(applyDakuten(selected));
				console.log(selectionHandler.node);
				selectionHandler.highlight();
			}
		}
	}
}

// Executes code based off mode state
function modeExecutor(e) {
	console.log("wah!");
	switch (mode) {
		case "normal":
			console.log("normal mode!");
			normalMode(e);
			break;
		case "edit":
			editMode(e);
			break;
	}
}

//###########################
// Listeners
//###########################
window.addEventListener("keyup", (e) => {
	keyInputHandler(e, false);
});

window.addEventListener("keydown", (e) => {
	keyInputHandler(e, true);

	// // Selects mode based off user input
	// modeSelector(e)

	// Executes code based off mode state
	modeExecutor(e);
});

window.addEventListener("mousemove", (e) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
});

function applyDakuten(kana) {
	if (kana == "か") {
		return "が";
	} else if (kana == "き") {
		return "ぎ";
	} else if (kana == "く") {
		return "ぐ";
	} else if (kana == "け") {
		return "げ";
	} else if (kana == "こ") {
		return "ご";
	} else if (kana == "が") {
		return "か";
	} else if (kana == "ぎ") {
		return "き";
	} else if (kana == "ぐ") {
		return "く";
	} else if (kana == "げ") {
		return "け";
	} else if (kana == "ご") {
		return "こ";
	} else if (kana == "さ") {
		return "ざ";
	} else if (kana == "し") {
		return "じ";
	} else if (kana == "す") {
		return "ず";
	} else if (kana == "せ") {
		return "ぜ";
	} else if (kana == "そ") {
		return "ぞ";
	} else if (kana == "ざ") {
		return "さ";
	} else if (kana == "じ") {
		return "し";
	} else if (kana == "ず") {
		return "す";
	} else if (kana == "ぜ") {
		return "せ";
	} else if (kana == "ぞ") {
		return "そ";
	} else if (kana == "た") {
		return "だ";
	} else if (kana == "ち") {
		return "ぢ";
	} else if (kana == "つ") {
		return "づ";
	} else if (kana == "て") {
		return "で";
	} else if (kana == "と") {
		return "ど";
	} else if (kana == "だ") {
		return "た";
	} else if (kana == "ぢ") {
		return "ち";
	} else if (kana == "づ") {
		return "つ";
	} else if (kana == "で") {
		return "て";
	} else if (kana == "ど") {
		return "と";
	} else if (kana == "は") {
		return "ば";
	} else if (kana == "ひ") {
		return "び";
	} else if (kana == "ふ") {
		return "ぶ";
	} else if (kana == "へ") {
		return "べ";
	} else if (kana == "ほ") {
		return "ぼ";
	} else if (kana == "ば") {
		return "ぱ";
	} else if (kana == "び") {
		return "ぴ";
	} else if (kana == "ぶ") {
		return "ぷ";
	} else if (kana == "べ") {
		return "ぺ";
	} else if (kana == "ぼ") {
		return "ぽ";
	} else if (kana == "ぱ") {
		return "は";
	} else if (kana == "ぴ") {
		return "ひ";
	} else if (kana == "ぷ") {
		return "ふ";
	} else if (kana == "ぺ") {
		return "へ";
	} else if (kana == "ぽ") {
		return "ほ";
	} else {
		return kana;
	}
}
