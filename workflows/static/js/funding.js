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
  var diagramXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" targetNamespace=\"\" xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd\"> <collaboration id=\"Collaboration_01ebkcu\"> <participant id=\"Participant_1ja3vod\" name=\"project funding&#10;\" processRef=\"Process_1yllhd1\" /> </collaboration> <process id=\"Process_1yllhd1\"> <laneSet> <lane id=\"Lane_1hae7rl\" name=\"students&#10;\"> <flowNodeRef>StartEvent_0gi4s07</flowNodeRef> <flowNodeRef>Task_0pzytze</flowNodeRef> <flowNodeRef>EndEvent_0c8s88j</flowNodeRef> <flowNodeRef>EndEvent_0rwrqwm</flowNodeRef> </lane> <lane id=\"Lane_12fbwfx\" name=\"admin\"> <flowNodeRef>Task_0ygra9r</flowNodeRef> <flowNodeRef>Task_1j8l5cg</flowNodeRef> <flowNodeRef>ExclusiveGateway_12nfs6y</flowNodeRef> <flowNodeRef>ExclusiveGateway_14parjr</flowNodeRef> <flowNodeRef>Task_0z54j15</flowNodeRef> </lane> <lane id=\"Lane_0wrkg3p\" name=\"staffs/alumni\"> <flowNodeRef>Task_0ytil4a</flowNodeRef> </lane> </laneSet> <startEvent id=\"StartEvent_0gi4s07\"> <outgoing>SequenceFlow_11o3glb</outgoing> </startEvent> <task id=\"Task_0pzytze\" name=\"send project proposal&#10;\"> <incoming>SequenceFlow_11o3glb</incoming> <outgoing>SequenceFlow_1w0jqd3</outgoing> </task> <sequenceFlow id=\"SequenceFlow_11o3glb\" sourceRef=\"StartEvent_0gi4s07\" targetRef=\"Task_0pzytze\" /> <task id=\"Task_0ygra9r\" name=\"check appropriation&#10;\"> <incoming>SequenceFlow_1w0jqd3</incoming> <outgoing>SequenceFlow_1t9r103</outgoing> </task> <sequenceFlow id=\"SequenceFlow_1w0jqd3\" sourceRef=\"Task_0pzytze\" targetRef=\"Task_0ygra9r\" /> <exclusiveGateway id=\"ExclusiveGateway_12nfs6y\" name=\"decision?\"> <incoming>SequenceFlow_1t9r103</incoming> <outgoing>SequenceFlow_04wsosq</outgoing> <outgoing>SequenceFlow_178497o</outgoing> </exclusiveGateway> <task id=\"Task_0ytil4a\" name=\"Support the interested project&#10;\"> <incoming>SequenceFlow_04wsosq</incoming> <outgoing>SequenceFlow_12vedwy</outgoing> </task> <sequenceFlow id=\"SequenceFlow_04wsosq\" name=\"approved\" sourceRef=\"ExclusiveGateway_12nfs6y\" targetRef=\"Task_0ytil4a\" /> <task id=\"Task_1j8l5cg\" name=\"send rejection&#10;\"> <incoming>SequenceFlow_178497o</incoming> <outgoing>SequenceFlow_15qxeaq</outgoing> </task> <sequenceFlow id=\"SequenceFlow_178497o\" name=\"declined\" sourceRef=\"ExclusiveGateway_12nfs6y\" targetRef=\"Task_1j8l5cg\" /> <sequenceFlow id=\"SequenceFlow_1t9r103\" sourceRef=\"Task_0ygra9r\" targetRef=\"ExclusiveGateway_12nfs6y\" /> <exclusiveGateway id=\"ExclusiveGateway_14parjr\" name=\"money meet the goal?&#10;\"> <incoming>SequenceFlow_12vedwy</incoming> <outgoing>SequenceFlow_1c9tsra</outgoing> </exclusiveGateway> <endEvent id=\"EndEvent_0c8s88j\" name=\"proposal dropped&#10;\"> <incoming>SequenceFlow_15qxeaq</incoming> </endEvent> <task id=\"Task_0z54j15\" name=\"transfer money to student&#10;\"> <incoming>SequenceFlow_1c9tsra</incoming> <outgoing>SequenceFlow_0np82as</outgoing> </task> <endEvent id=\"EndEvent_0rwrqwm\" name=\"start project&#10;\"> <incoming>SequenceFlow_0np82as</incoming> </endEvent> <sequenceFlow id=\"SequenceFlow_15qxeaq\" sourceRef=\"Task_1j8l5cg\" targetRef=\"EndEvent_0c8s88j\" /> <sequenceFlow id=\"SequenceFlow_12vedwy\" sourceRef=\"Task_0ytil4a\" targetRef=\"ExclusiveGateway_14parjr\" /> <sequenceFlow id=\"SequenceFlow_1c9tsra\" name=\"yes\" sourceRef=\"ExclusiveGateway_14parjr\" targetRef=\"Task_0z54j15\" /> <sequenceFlow id=\"SequenceFlow_0np82as\" sourceRef=\"Task_0z54j15\" targetRef=\"EndEvent_0rwrqwm\" /> </process> <bpmndi:BPMNDiagram id=\"sid-74620812-92c4-44e5-949c-aa47393d3830\"> <bpmndi:BPMNPlane id=\"sid-cdcae759-2af7-4a6d-bd02-53f3352a731d\" bpmnElement=\"Collaboration_01ebkcu\"> <bpmndi:BPMNShape id=\"Participant_1ja3vod_di\" bpmnElement=\"Participant_1ja3vod\"> <omgdc:Bounds x=\"291\" y=\"75\" width=\"1122\" height=\"340\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_1hae7rl_di\" bpmnElement=\"Lane_1hae7rl\"> <omgdc:Bounds x=\"321\" y=\"75\" width=\"1092\" height=\"106\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_12fbwfx_di\" bpmnElement=\"Lane_12fbwfx\"> <omgdc:Bounds x=\"321\" y=\"181\" width=\"1092\" height=\"114\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_0wrkg3p_di\" bpmnElement=\"Lane_0wrkg3p\"> <omgdc:Bounds x=\"321\" y=\"295\" width=\"1092\" height=\"120\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"StartEvent_0gi4s07_di\" bpmnElement=\"StartEvent_0gi4s07\"> <omgdc:Bounds x=\"377\" y=\"111\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"395\" y=\"147\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_0pzytze_di\" bpmnElement=\"Task_0pzytze\"> <omgdc:Bounds x=\"461\" y=\"89\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_11o3glb_di\" bpmnElement=\"SequenceFlow_11o3glb\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"413\" y=\"129\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"461\" y=\"129\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"437\" y=\"104\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_0ygra9r_di\" bpmnElement=\"Task_0ygra9r\"> <omgdc:Bounds x=\"577\" y=\"198\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_1w0jqd3_di\" bpmnElement=\"SequenceFlow_1w0jqd3\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"511\" y=\"169\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"511\" y=\"184\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"627\" y=\"184\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"627\" y=\"198\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"569\" y=\"159\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"ExclusiveGateway_12nfs6y_di\" bpmnElement=\"ExclusiveGateway_12nfs6y\" isMarkerVisible=\"true\"> <omgdc:Bounds x=\"756\" y=\"213\" width=\"50\" height=\"50\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"781\" y=\"263\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_0ytil4a_di\" bpmnElement=\"Task_0ytil4a\"> <omgdc:Bounds x=\"731\" y=\"315\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_04wsosq_di\" bpmnElement=\"SequenceFlow_04wsosq\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"781\" y=\"263\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"781\" y=\"315\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"730\" y=\"277\" width=\"49\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_1j8l5cg_di\" bpmnElement=\"Task_1j8l5cg\"> <omgdc:Bounds x=\"898\" y=\"198\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_178497o_di\" bpmnElement=\"SequenceFlow_178497o\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"806\" y=\"238\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"898\" y=\"238\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"827\" y=\"221\" width=\"43\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_1t9r103_di\" bpmnElement=\"SequenceFlow_1t9r103\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"677\" y=\"238\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"756\" y=\"238\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"717\" y=\"213\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"ExclusiveGateway_14parjr_di\" bpmnElement=\"ExclusiveGateway_14parjr\" isMarkerVisible=\"true\"> <omgdc:Bounds x=\"1103\" y=\"213\" width=\"50\" height=\"50\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1128\" y=\"263\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"EndEvent_0c8s88j_di\" bpmnElement=\"EndEvent_0c8s88j\"> <omgdc:Bounds x=\"930\" y=\"111\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"948\" y=\"147\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_0z54j15_di\" bpmnElement=\"Task_0z54j15\"> <omgdc:Bounds x=\"1238\" y=\"198\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"EndEvent_0rwrqwm_di\" bpmnElement=\"EndEvent_0rwrqwm\"> <omgdc:Bounds x=\"1270\" y=\"111\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1288\" y=\"147\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_15qxeaq_di\" bpmnElement=\"SequenceFlow_15qxeaq\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"948\" y=\"198\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"948\" y=\"147\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"963\" y=\"162.5\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_12vedwy_di\" bpmnElement=\"SequenceFlow_12vedwy\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"831\" y=\"355\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1128\" y=\"355\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1128\" y=\"263\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"980\" y=\"330\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_1c9tsra_di\" bpmnElement=\"SequenceFlow_1c9tsra\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1153\" y=\"238\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1238\" y=\"238\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1179\" y=\"218\" width=\"21\" height=\"13\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_0np82as_di\" bpmnElement=\"SequenceFlow_0np82as\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1288\" y=\"198\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1288\" y=\"147\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1303\" y=\"162.5\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> </bpmndi:BPMNPlane> <bpmndi:BPMNLabelStyle id=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\"> <omgdc:Font name=\"Arial\" size=\"11\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> <bpmndi:BPMNLabelStyle id=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\"> <omgdc:Font name=\"Arial\" size=\"12\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> </bpmndi:BPMNDiagram> </definitions>"

  importXML(diagramXML);

})(window.BpmnJS, window.jQuery);