var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}
/**
 * bpmn-js-seed
 *
 * This is an example script that loads an embedded diagram file <diagramXML>
 * and opens it using the bpmn-js modeler.
 */
(function(BpmnModeler, $) {

  // create modeler
  var bpmnModeler = new BpmnModeler({
    container: '#canvas'
  });


  // import function
  function importXML(xml) {

    // import diagram
    bpmnModeler.importXML(xml, function(err) {

      if (err) {
        return console.error('could not import BPMN 2.0 diagram', err);
      }

      var canvas = bpmnModeler.get('canvas');

      // zoom to fit full viewport
      canvas.zoom('fit-viewport');
    });


    // save diagram on button click
    var saveButton = document.querySelector('#save-button');

    saveButton.addEventListener('click', function() 	{
        var canvas = bpmnModeler.get('canvas');
        //var canvas = document.getElementById('canvas');
        console.info(canvas)
      	var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    	window.location.href = image;
    });

    var downloadButton = document.querySelector('#download-button');
    downloadButton.addEventListener('click', function(){
        bpmnModeler.saveXML({ format: true }, function(err, xml) {
         if (err) {
          console.error('diagram save failed', err);
        } else {
          console.info('diagram saved');
          //console.info(xml);
          var blob = new Blob([xml], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "diagram.xml");
        }
    });
    });
  }


  // a diagram to display
  //
  // see index-async.js on how to load the diagram asynchronously from a url.
  // (requires a running webserver)
  var diagramXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" targetNamespace=\"\" xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd\"> <collaboration id=\"Collaboration_0vfty52\"> <participant id=\"Participant_0cvd8tg\" name=\"Make Announcement&#10;\" processRef=\"Process_04verzk\" /> </collaboration> <process id=\"Process_04verzk\"> <laneSet> <lane id=\"Lane_1o3g1bo\" name=\"Professors\"> <flowNodeRef>Task_1f671zf</flowNodeRef> <flowNodeRef>StartEvent_06tptiw</flowNodeRef> <flowNodeRef>EndEvent_0w6ae37</flowNodeRef> <flowNodeRef>EndEvent_1klueu4</flowNodeRef> </lane> <lane id=\"Lane_0qnwzfg\" name=\"admin\"> <flowNodeRef>Task_1kmzx90</flowNodeRef> <flowNodeRef>ExclusiveGateway_051yn01</flowNodeRef> <flowNodeRef>Task_1guuhwq</flowNodeRef> </lane> </laneSet> <startEvent id=\"StartEvent_06tptiw\"> <outgoing>SequenceFlow_0avtmoa</outgoing> </startEvent> <task id=\"Task_1f671zf\" name=\"Make Annoucement&#10;\"> <incoming>SequenceFlow_0avtmoa</incoming> <outgoing>SequenceFlow_11ejdyt</outgoing> </task> <sequenceFlow id=\"SequenceFlow_0avtmoa\" sourceRef=\"StartEvent_06tptiw\" targetRef=\"Task_1f671zf\" /> <sequenceFlow id=\"SequenceFlow_11ejdyt\" sourceRef=\"Task_1f671zf\" targetRef=\"Task_1kmzx90\" /> <task id=\"Task_1kmzx90\" name=\"Check Appropriation&#10;\"> <incoming>SequenceFlow_11ejdyt</incoming> <outgoing>SequenceFlow_1hqc0bt</outgoing> </task> <exclusiveGateway id=\"ExclusiveGateway_051yn01\" name=\"appove?\"> <incoming>SequenceFlow_1hqc0bt</incoming> <outgoing>SequenceFlow_0haigdk</outgoing> <outgoing>SequenceFlow_023rqqj</outgoing> </exclusiveGateway> <sequenceFlow id=\"SequenceFlow_1hqc0bt\" sourceRef=\"Task_1kmzx90\" targetRef=\"ExclusiveGateway_051yn01\" /> <endEvent id=\"EndEvent_0w6ae37\" name=\"announcement dropped&#10;\"> <incoming>SequenceFlow_0kfaa6b</incoming> </endEvent> <endEvent id=\"EndEvent_1klueu4\" name=\"announcement posted&#10;\"> <incoming>SequenceFlow_0haigdk</incoming> </endEvent> <sequenceFlow id=\"SequenceFlow_0haigdk\" name=\"approved\" sourceRef=\"ExclusiveGateway_051yn01\" targetRef=\"EndEvent_1klueu4\" /> <sequenceFlow id=\"SequenceFlow_023rqqj\" name=\"disapproved\" sourceRef=\"ExclusiveGateway_051yn01\" targetRef=\"Task_1guuhwq\" /> <task id=\"Task_1guuhwq\" name=\"Send rejection&#10;\"> <incoming>SequenceFlow_023rqqj</incoming> <outgoing>SequenceFlow_0kfaa6b</outgoing> </task> <sequenceFlow id=\"SequenceFlow_0kfaa6b\" sourceRef=\"Task_1guuhwq\" targetRef=\"EndEvent_0w6ae37\" /> </process> <bpmndi:BPMNDiagram id=\"sid-74620812-92c4-44e5-949c-aa47393d3830\"> <bpmndi:BPMNPlane id=\"sid-cdcae759-2af7-4a6d-bd02-53f3352a731d\" bpmnElement=\"Collaboration_0vfty52\"> <bpmndi:BPMNShape id=\"Participant_0cvd8tg_di\" bpmnElement=\"Participant_0cvd8tg\"> <omgdc:Bounds x=\"74\" y=\"89\" width=\"826\" height=\"250\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_1o3g1bo_di\" bpmnElement=\"Lane_1o3g1bo\"> <omgdc:Bounds x=\"104\" y=\"89\" width=\"796\" height=\"125\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_0qnwzfg_di\" bpmnElement=\"Lane_0qnwzfg\"> <omgdc:Bounds x=\"104\" y=\"214\" width=\"796\" height=\"125\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"StartEvent_06tptiw_di\" bpmnElement=\"StartEvent_06tptiw\"> <omgdc:Bounds x=\"151\" y=\"134\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"169\" y=\"170\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_1f671zf_di\" bpmnElement=\"Task_1f671zf\"> <omgdc:Bounds x=\"256\" y=\"112\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"EndEvent_1klueu4_di\" bpmnElement=\"EndEvent_1klueu4\"> <omgdc:Bounds x=\"584\" y=\"112\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"503\" y=\"117\" width=\"77\" height=\"26\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_1kmzx90_di\" bpmnElement=\"Task_1kmzx90\"> <omgdc:Bounds x=\"409\" y=\"235\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"EndEvent_0w6ae37_di\" bpmnElement=\"EndEvent_0w6ae37\"> <omgdc:Bounds x=\"790\" y=\"112\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"808\" y=\"148\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_0avtmoa_di\" bpmnElement=\"SequenceFlow_0avtmoa\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"187\" y=\"152\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"256\" y=\"152\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"222\" y=\"127\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"ExclusiveGateway_051yn01_di\" bpmnElement=\"ExclusiveGateway_051yn01\" isMarkerVisible=\"true\"> <omgdc:Bounds x=\"577\" y=\"250\" width=\"50\" height=\"50\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"579\" y=\"300\" width=\"45\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_11ejdyt_di\" bpmnElement=\"SequenceFlow_11ejdyt\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"356\" y=\"152\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"459\" y=\"152\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"459\" y=\"235\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"408\" y=\"137\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_1hqc0bt_di\" bpmnElement=\"SequenceFlow_1hqc0bt\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"509\" y=\"275\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"577\" y=\"275\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"543\" y=\"250\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_0haigdk_di\" bpmnElement=\"SequenceFlow_0haigdk\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"602\" y=\"250\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"602\" y=\"148\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"606\" y=\"185\" width=\"49\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_1guuhwq_di\" bpmnElement=\"Task_1guuhwq\"> <omgdc:Bounds x=\"758\" y=\"235\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_023rqqj_di\" bpmnElement=\"SequenceFlow_023rqqj\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"627\" y=\"275\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"758\" y=\"275\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"661\" y=\"260\" width=\"63\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_0kfaa6b_di\" bpmnElement=\"SequenceFlow_0kfaa6b\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"808\" y=\"235\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"808\" y=\"148\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"823\" y=\"181.5\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> </bpmndi:BPMNPlane> <bpmndi:BPMNLabelStyle id=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\"> <omgdc:Font name=\"Arial\" size=\"11\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> <bpmndi:BPMNLabelStyle id=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\"> <omgdc:Font name=\"Arial\" size=\"12\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> </bpmndi:BPMNDiagram> </definitions>"


  importXML(diagramXML);

})(window.BpmnJS, window.jQuery);