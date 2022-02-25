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
			selection.anchorOffset < selection.focusOffset // used to be extentOffset
				? selection.anchorOffset
				: selection.focusOffset;

		this.rightOff =
			selection.focusOffset > selection.anchorOffset
				? selection.focusOffset
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
	const key = e.key;
	if (selectionHandler.hasSelection() && specialKeysNotDown()) {
		if (key === "c") {
			// If "c" pressed
			mode = "edit";

			textField.setPosition(mousePos.x, mousePos.y);
			textField.setVisibility(true);
			selectionHandler.tagSelected();
			textField.focus();
		} else if (key === "z") {
			selectionHandler.tagSelected();

			// Get selected text
			const selected = selectionHandler.getSelection();
			if (selected.length === 1) {
				selectionHandler.replacedTaggedText(applyDakuten(selected));
				selectionHandler.highlight();
			}
		} else if (key === "d") {
			selectionHandler.tagSelected();
			selectionHandler.replacedTaggedText("");
		} else if (key === "x") {
			selectionHandler.tagSelected();

			// Get selecte text
			const selected = selectionHandler.getSelection();
			if (selected.length === 1) {
				selectionHandler.replacedTaggedText(applyChiisai(selected));
				selectionHandler.highlight();
			}
		} else if (key === "s") {
			selectionHandler.tagSelected();
			// Adds white space between TWO characters
			const selected = selectionHandler.getSelection();
			console.log(selected);
			if (selected.length === 2) {
				selectionHandler.replacedTaggedText(
					selected[0] + " " + selected[1] // this method can only create one space of white space between letters &nbsp;
				);
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

// ONLY WORKS FOR HIRAGANA ATM
function applyChiisai(character) {
	switch (character) {
		// HIRAGANA
		case "つ":
			return "っ";
		case "っ":
			return "つ";
		case "あ":
			return "ぁ";
		case "ぁ":
			return "あ";
		case "い":
			return "ぃ";
		case "ぃ":
			return "い";
		case "え":
			return "ぇ";
		case "ぇ":
			return "え";
		case "お":
			return "ぉ";
		case "ぉ":
			return "お";
		case "う":
			return "ぅ";
		case "ぅ":
			return "う";
		case "や":
			return "ゃ";
		case "ゃ":
			return "や";
		case "ゆ":
			return "ゅ";
		case "ゅ":
			return "ゆ";
		case "よ":
			return "ょ";
		case "ょ":
			return "よ";
		case "わ":
			return "ゎ";
		case "ゎ":
			return "わ";

		// KATAKANA
		case "ア":
			return "ァ";
		case "ァ":
			return "ア";
		case "イ":
			return "ィ";
		case "ィ":
			return "イ";
		case "ウ":
			return "ゥ";
		case "ゥ":
			return "ウ";
		case "エ":
			return "ェ";
		case "ェ":
			return "エ";
		case "オ":
			return "ォ";
		case "ォ":
			return "オ";
		case "ツ":
			return "ッ";
		case "ッ":
			return "ツ";
		case "ヤ":
			return "ャ";
		case "ャ":
			return "ヤ";
		case "ユ":
			return "ュ";
		case "ュ":
			return "ユ";
		case "ヨ":
			return "ョ";
		case "ョ":
			return "ヨ";
		case "ワ":
			return "ヮ";
		case "ヮ":
			return "ワ";

		// EXTRAS
		case "カ":
			return "ヵ";
		case "ヵ":
			return "カ";
		case "ケ":
			return "ヶ";
		case "ヶ":
			return "ケ";

		default:
			return character;
	}
}

function applyDakuten(character) {
	switch (character) {
		// HIRAGANA
		case "か":
			return "が";
		case "き":
			return "ぎ";
		case "く":
			return "ぐ";
		case "け":
			return "げ";
		case "こ":
			return "ご";
		case "が":
			return "か";
		case "ぎ":
			return "き";
		case "ぐ":
			return "く";
		case "げ":
			return "け";
		case "ご":
			return "こ";
		case "さ":
			return "ざ";
		case "し":
			return "じ";
		case "す":
			return "ず";
		case "せ":
			return "ぜ";
		case "そ":
			return "ぞ";
		case "ざ":
			return "さ";
		case "じ":
			return "し";
		case "ず":
			return "す";
		case "ぜ":
			return "せ";
		case "ぞ":
			return "そ";
		case "た":
			return "だ";
		case "ち":
			return "ぢ";
		case "つ":
			return "づ";
		case "て":
			return "で";
		case "と":
			return "ど";
		case "だ":
			return "た";
		case "ぢ":
			return "ち";
		case "づ":
			return "つ";
		case "で":
			return "て";
		case "ど":
			return "と";
		case "は":
			return "ば";
		case "ひ":
			return "び";
		case "ふ":
			return "ぶ";
		case "へ":
			return "べ";
		case "ほ":
			return "ぼ";
		case "ば":
			return "ぱ";
		case "び":
			return "ぴ";
		case "ぶ":
			return "ぷ";
		case "べ":
			return "ぺ";
		case "ぼ":
			return "ぽ";
		case "ぱ":
			return "は";
		case "ぴ":
			return "ひ";
		case "ぷ":
			return "ふ";
		case "ぺ":
			return "へ";
		case "ぽ":
			return "ほ";
		// KATAKANA
		case "カ":
			return "ガ";
		case "キ":
			return "ギ";
		case "ク":
			return "グ";
		case "ケ":
			return "ゲ";
		case "コ":
			return "ゴ";
		case "ガ":
			return "カ";
		case "ギ":
			return "キ";
		case "グ":
			return "ク";
		case "ゲ":
			return "ケ";
		case "ゴ":
			return "コ";
		case "サ":
			return "ザ";
		case "シ":
			return "ジ";
		case "ス":
			return "ズ";
		case "セ":
			return "ゼ";
		case "ソ":
			return "ゾ";
		case "ザ":
			return "サ";
		case "ジ":
			return "シ";
		case "ズ":
			return "ス";
		case "ゼ":
			return "セ";
		case "ゾ":
			return "ソ";
		case "タ":
			return "ダ";
		case "チ":
			return "ヂ";
		case "ツ":
			return "ヅ";
		case "テ":
			return "デ";
		case "ト":
			return "ド";
		case "ダ":
			return "タ";
		case "ヂ":
			return "チ";
		case "ヅ":
			return "ツ";
		case "デ":
			return "テ";
		case "ド":
			return "ト";
		case "ハ":
			return "バ";
		case "ヒ":
			return "ビ";
		case "フ":
			return "ブ";
		case "ヘ":
			return "ベ";
		case "ホ":
			return "ボ";
		case "バ":
			return "パ";
		case "ビ":
			return "ピ";
		case "ブ":
			return "プ";
		case "ベ":
			return "ペ";
		case "ボ":
			return "ポ";
		case "パ":
			return "ハ";
		case "ピ":
			return "ヒ";
		case "プ":
			return "フ";
		case "ペ":
			return "ヘ";
		case "ポ":
			return "ホ";
		default:
			return character;
	}
}
