import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class MultiSelectControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context : ComponentFramework.Context<IInputs>;
	private _container : HTMLDivElement;
	private _mainContainer : HTMLDivElement;
	private _unorderedList : HTMLUListElement;
	private _errorLabel : HTMLLabelElement;
	public _guidList : string[];
	private _checkBoxChanged : EventListenerOrEventListenerObject;
	private _notifyOutputChanged: () => void;
	multiFieldSelect: any;
	options: any[];
	private intialValue:number[]|null=[];
	notifyInternal: boolean=false;
 
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		console.log("on init calling");
		this._context = context;
		this._container = container;
		this._mainContainer = document.createElement("div");
		this._mainContainer.classList.add("multiselect-container");
		this._notifyOutputChanged = notifyOutputChanged;
		this._checkBoxChanged = this.checkBoxChanged.bind(this);
		this.multiFieldSelect = this._context.parameters.multiField;
		this._container.appendChild(this._mainContainer);
		this.PrePareOptions();
		this.RenderOptions();
  }

  PrePareOptions() {
    let multiFieldSelect = this._context.parameters.multiField as any;
	this.intialValue=this._context.parameters.multiField.raw;
    this.options = [];
    for (var i = 0; i < multiFieldSelect.attributes.Options.length; i++) {
      let multiFieldValue = this._context.parameters.multiField.raw;
      if (typeof multiFieldValue === "string")
        multiFieldValue = JSON.parse(multiFieldValue);
      let selectedItems = multiFieldValue;
      let op = {
        Label: multiFieldSelect.attributes.Options[i].Label,
        id: multiFieldSelect.attributes.LogicalName + "-" + multiFieldSelect.attributes.Options[i].Value,
        name: multiFieldSelect.attributes.LogicalName + "-" + multiFieldSelect.attributes.Options[i].Value,
        value: multiFieldSelect.attributes.Options[i].Value.toString(),
        isSelcted: (selectedItems == null ? 0 : selectedItems.findIndex((it) => it == multiFieldSelect.attributes.Options[i].Value)) > -1
      };
      this.options.push(op);
    }
  }
  RenderOptions() {
    this._unorderedList = document.createElement("ul");
    this._errorLabel = document.createElement("label");
    this._unorderedList.classList.add("ks-cboxtags");
    this.options.forEach((option) => {
      let newUList = this.RenderOption(option);
      this._unorderedList.appendChild(newUList);
    });
    this._mainContainer.innerHTML = "";
    this._mainContainer.appendChild(this._unorderedList);
    this._mainContainer.appendChild(this._errorLabel);
  }
  SaveEventListerner(initialValue){
	this.intialValue=initialValue;
	this.PrePareOptions();
	this.RenderOptions();
  }
  RenderOption(option) {
    let newLabels = option.Label;
    var newChkBox = document.createElement("input");
    var newLabel = document.createElement("label");
    var newUList = document.createElement("li");
    newChkBox.type = "checkbox";
    newChkBox.id = option.id;
    newChkBox.name = option.name;
    newChkBox.value = option.value.toString();
    newChkBox.checked = option.isSelcted;
    newChkBox.addEventListener("change", this._checkBoxChanged);
    newLabel.innerHTML = newLabels;
    newLabel.htmlFor = option.id;
	if(this.intialValue&&this.intialValue.indexOf(+ option.value)>-1){		
		newLabel.classList.add('preselected');
	}
    newUList.appendChild(newChkBox);
    newUList.appendChild(newLabel);
    return newUList;
  }
 
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this._context = context;
		if(this.notifyInternal){
			this.notifyInternal=false;
		}else{
			this.intialValue=this._context.parameters.multiField.raw;
		}
		let multiFieldValue = this._context.parameters.multiField.raw;
		if (typeof multiFieldValue === "string")
		  multiFieldValue = JSON.parse(multiFieldValue);
		let selectedItems = multiFieldValue;
		if(this.options.length !==context.parameters.multiField.attributes?.Options.length){
			this.PrePareOptions();
		}
		this.options.forEach((it) => {
		  it.isSelcted =selectedItems!=undefined? selectedItems.findIndex((sl) => sl == it.value) > -1:false;
		});
		this.RenderOptions();
		console.log("updateView");
	}
	checkBoxChanged(evnt) {
		var targetInput = evnt.target;
		console.log(evnt.target);
		let ooption = this.options.find((it) => it.value == +targetInput.value);
		ooption.isSelcted = targetInput.checked;
		this.notifyInternal=true
		this._notifyOutputChanged();
	  }
	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			multiField: this.options.filter((it) => it.isSelcted).map((it) => +it.value)
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

 
}
