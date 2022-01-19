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
		this.node;
		this.nodeString;

		this.leftOff;
		this.rightOff;
		this.nodeStringLength;
	}
	// Collect the CURRENT selection info
	collectSelectionInfo() {
		this.leftOff;
		this.rightOff;
		this.nodeStringLength;
	}
	getSelectionInfo() {
		/* 
		// RETURNS [
			leftOffset, 
			rightOffset, 
			lengthOfSelected(excluding non visible characters like \n),
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
		var nodeStringLength = selection.anchorNode.length;
		var nodeString = selection.anchorNode.textContent; //!@#!@#!@# get rid of, use this.string instead

		// Update node
		this.node = selection.anchorNode;
		this.nodeString = nodeString;

		// RETURN
		return [leftOff, rightOff, nodeStringLength];
	}
	getNode() {
		if (this.node) {
			return this.node;
		} else {
			console.error("this.node is not set!!!");
		}
	}
	getNodeString() {
		return this.nodeString;
	}
	getSelectedString() {}
	getAdjacentSelectedStrings() {
		// postions
		[leftOff, rightOff, nodeStringLength] = this.getSelectionInfo();

		return [
			nodeString.substring(0, leftOff),
			nodeString.substring(rightOff, nodeStringLength),
		];
	}
	// User has something selected
	hasSelection() {
		return window.getSelection().anchorNode.length > 0;
	}

	//###########################
	//	USER INPUT SUBSCRIPTIONS
	//###########################

	// Subscription Conditionals
	keyDownSubscription(e, cb) {
		if (e.key === "Enter") {
			// this.subscriptionExecution(e);
			cb();
		}
	}

	// Subscription Functionality Execution
	subscriptionExecution(e) {}
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
	//###########################
	//	USER INPUT SUBSCRIPTIONS
	//###########################

	// Subscription Conditionals
	keyDownSubscription(e) {
		// If has something selected
		if (selectionHandler.hasSelection()) {
			// If "c" pressed
			if (e.key === "c") {
				console.log("after c!!!");
				if (
					mode === "normal" &&
					!keysDown.Shift &&
					!keysDown.Control &&
					!keysDown.Alt
				) {
					this.subscriptionExecution();
				}
			}
		}
	}

	// Subscription Functionality Execution
	subscriptionExecution(e) {
		console.log("I'm inside!");
		mode = "edit";

		this.setPosition(mousePos.x, mousePos.y);
		this.setVisibility(true);
		selectionHandler.getSelectionInfo();
		this.focus();
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

//###########################
// Listeners
//###########################
window.addEventListener("keyup", (e) => {
	keyInputHandler(e, false);
});

window.addEventListener("keydown", (e) => {
	keyInputHandler(e, true);

	textField.keyDownSubscription(e);
	selectionHandler.keyDownSubscription(e, () => {
		const textFieldVal = textField.getVal();
		if (textFieldVal !== "") {
			// Generate new textContent
			[strLeft, strRight] = selectionHandler.getAdjacentSelectedStrings();
			var newStr = strLeft + textFieldVal + strRight;

			// Replace node textContent
			selectionHandler.getNode().textContent = newStr;
		}

		// Reset textfield
		textField.clearVal();
		textField.setVisibility(false);

		mode = "normal";
	});
});

window.addEventListener("mousemove", (e) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
});
