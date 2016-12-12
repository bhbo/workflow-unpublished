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
  var diagramXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" targetNamespace=\"\" xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd\"> <collaboration id=\"Collaboration_0r5mhun\"> <participant id=\"Participant_1v9riq0\" name=\"Job Application&#10;\" processRef=\"Process_0cwf8d9\" /> </collaboration> <process id=\"Process_0cwf8d9\"> <laneSet> <lane id=\"Lane_0i6hlvo\" name=\"staffs&#10;\"> <flowNodeRef>Task_14m86oz</flowNodeRef> <flowNodeRef>Task_11lrdnd</flowNodeRef> <flowNodeRef>StartEvent_0h2otfr</flowNodeRef> <flowNodeRef>EndEvent_0ngoyzi</flowNodeRef> <flowNodeRef>ExclusiveGateway_0u4xd65</flowNodeRef> </lane> <lane id=\"Lane_0nvh7ko\" name=\"Admin\"> <flowNodeRef>Task_098p6ys</flowNodeRef> <flowNodeRef>ExclusiveGateway_14ynsyn</flowNodeRef> <flowNodeRef>Task_0mrvwyn</flowNodeRef> </lane> <lane id=\"Lane_1htvvpu\" name=\"users&#10;\"> <flowNodeRef>Task_0asiu68</flowNodeRef> <flowNodeRef>EndEvent_1o0zvlx</flowNodeRef> <flowNodeRef>EndEvent_0vzssxe</flowNodeRef> </lane> </laneSet> <sequenceFlow id=\"SequenceFlow_0sptl5t\" sourceRef=\"StartEvent_0h2otfr\" targetRef=\"Task_14m86oz\" /> <startEvent id=\"StartEvent_0h2otfr\"> <outgoing>SequenceFlow_0sptl5t</outgoing> </startEvent> <task id=\"Task_14m86oz\" name=\"Make announement on job position&#10;\"> <incoming>SequenceFlow_0sptl5t</incoming> <outgoing>SequenceFlow_01szo4p</outgoing> </task> <sequenceFlow id=\"SequenceFlow_01szo4p\" sourceRef=\"Task_14m86oz\" targetRef=\"Task_098p6ys\" /> <sequenceFlow id=\"SequenceFlow_1po1ps3\" sourceRef=\"Task_098p6ys\" targetRef=\"ExclusiveGateway_14ynsyn\" /> <sequenceFlow id=\"SequenceFlow_0o6o297\" name=\"approved\" sourceRef=\"ExclusiveGateway_14ynsyn\" targetRef=\"Task_0asiu68\" /> <sequenceFlow id=\"SequenceFlow_1xkokg3\" name=\"declined\" sourceRef=\"ExclusiveGateway_14ynsyn\" targetRef=\"Task_0mrvwyn\" /> <endEvent id=\"EndEvent_0ngoyzi\" name=\"announcement dropped&#10;\"> <incoming>SequenceFlow_09b619t</incoming> </endEvent> <sequenceFlow id=\"SequenceFlow_09b619t\" sourceRef=\"Task_0mrvwyn\" targetRef=\"EndEvent_0ngoyzi\" /> <exclusiveGateway id=\"ExclusiveGateway_0u4xd65\" name=\"decision?&#10;\"> <incoming>SequenceFlow_0d3r2hd</incoming> <outgoing>SequenceFlow_0a2moze</outgoing> <outgoing>SequenceFlow_1ckerms</outgoing> </exclusiveGateway> <sequenceFlow id=\"SequenceFlow_0d3r2hd\" sourceRef=\"Task_0asiu68\" targetRef=\"ExclusiveGateway_0u4xd65\" /> <task id=\"Task_11lrdnd\" name=\"Send rejection&#10;\"> <incoming>SequenceFlow_0a2moze</incoming> <outgoing>SequenceFlow_1x8yqxg</outgoing> </task> <sequenceFlow id=\"SequenceFlow_0a2moze\" name=\"declined\" sourceRef=\"ExclusiveGateway_0u4xd65\" targetRef=\"Task_11lrdnd\" /> <sequenceFlow id=\"SequenceFlow_1x8yqxg\" sourceRef=\"Task_11lrdnd\" targetRef=\"EndEvent_0vzssxe\" /> <sequenceFlow id=\"SequenceFlow_1ckerms\" name=\"approved\" sourceRef=\"ExclusiveGateway_0u4xd65\" targetRef=\"EndEvent_1o0zvlx\" /> <task id=\"Task_098p6ys\" name=\"Check appropriation&#10;\"> <incoming>SequenceFlow_01szo4p</incoming> <outgoing>SequenceFlow_1po1ps3</outgoing> </task> <exclusiveGateway id=\"ExclusiveGateway_14ynsyn\" name=\"Decision?\"> <incoming>SequenceFlow_1po1ps3</incoming> <outgoing>SequenceFlow_0o6o297</outgoing> <outgoing>SequenceFlow_1xkokg3</outgoing> </exclusiveGateway> <task id=\"Task_0mrvwyn\" name=\"Send rejection&#10;\"> <incoming>SequenceFlow_1xkokg3</incoming> <outgoing>SequenceFlow_09b619t</outgoing> </task> <task id=\"Task_0asiu68\" name=\"File application&#10;\"> <incoming>SequenceFlow_0o6o297</incoming> <outgoing>SequenceFlow_0d3r2hd</outgoing> </task> <endEvent id=\"EndEvent_1o0zvlx\" name=\"make appointment&#10;\"> <incoming>SequenceFlow_1ckerms</incoming> </endEvent> <endEvent id=\"EndEvent_0vzssxe\" name=\"application dropped&#10;\"> <incoming>SequenceFlow_1x8yqxg</incoming> </endEvent> </process> <bpmndi:BPMNDiagram id=\"sid-74620812-92c4-44e5-949c-aa47393d3830\"> <bpmndi:BPMNPlane id=\"sid-cdcae759-2af7-4a6d-bd02-53f3352a731d\" bpmnElement=\"Collaboration_0r5mhun\"> <bpmndi:BPMNShape id=\"Participant_1v9riq0_di\" bpmnElement=\"Participant_1v9riq0\"> <omgdc:Bounds x=\"389\" y=\"-31\" width=\"1143\" height=\"408\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_0i6hlvo_di\" bpmnElement=\"Lane_0i6hlvo\"> <omgdc:Bounds x=\"419\" y=\"-31\" width=\"1113\" height=\"142\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_0nvh7ko_di\" bpmnElement=\"Lane_0nvh7ko\"> <omgdc:Bounds x=\"419\" y=\"111\" width=\"1113\" height=\"119\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Lane_1htvvpu_di\" bpmnElement=\"Lane_1htvvpu\"> <omgdc:Bounds x=\"419\" y=\"230\" width=\"1113\" height=\"147\" /> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"StartEvent_0h2otfr_di\" bpmnElement=\"StartEvent_0h2otfr\"> <omgdc:Bounds x=\"469\" y=\"20\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"487\" y=\"56\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_14m86oz_di\" bpmnElement=\"Task_14m86oz\"> <omgdc:Bounds x=\"545\" y=\"-2\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_0sptl5t_di\" bpmnElement=\"SequenceFlow_0sptl5t\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"505\" y=\"38\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"545\" y=\"38\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"525\" y=\"23\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_098p6ys_di\" bpmnElement=\"Task_098p6ys\"> <omgdc:Bounds x=\"627.615\" y=\"135.846\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_01szo4p_di\" bpmnElement=\"SequenceFlow_01szo4p\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"595\" y=\"78\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"595\" y=\"107\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"678\" y=\"107\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"678\" y=\"136\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"637\" y=\"92\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"ExclusiveGateway_14ynsyn_di\" bpmnElement=\"ExclusiveGateway_14ynsyn\" isMarkerVisible=\"true\"> <omgdc:Bounds x=\"789.615\" y=\"151\" width=\"50\" height=\"50\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"815\" y=\"201\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_1po1ps3_di\" bpmnElement=\"SequenceFlow_1po1ps3\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"728\" y=\"176\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"759\" y=\"176\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"759\" y=\"176\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"790\" y=\"176\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"774\" y=\"176\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_0asiu68_di\" bpmnElement=\"Task_0asiu68\"> <omgdc:Bounds x=\"764.615\" y=\"273.846\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_0o6o297_di\" bpmnElement=\"SequenceFlow_0o6o297\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"815\" y=\"201\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"815\" y=\"274\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"763\" y=\"238.5\" width=\"50\" height=\"14\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"Task_0mrvwyn_di\" bpmnElement=\"Task_0mrvwyn\"> <omgdc:Bounds x=\"899.615\" y=\"136\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_1xkokg3_di\" bpmnElement=\"SequenceFlow_1xkokg3\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"840\" y=\"176\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"900\" y=\"176\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"844\" y=\"158\" width=\"44\" height=\"14\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"EndEvent_0ngoyzi_di\" bpmnElement=\"EndEvent_0ngoyzi\"> <omgdc:Bounds x=\"932\" y=\"-5.153999999999996\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"950\" y=\"30.846000000000004\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_09b619t_di\" bpmnElement=\"SequenceFlow_09b619t\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"950\" y=\"136\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"950\" y=\"31\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"965\" y=\"83.5\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"ExclusiveGateway_0u4xd65_di\" bpmnElement=\"ExclusiveGateway_0u4xd65\" isMarkerVisible=\"true\"> <omgdc:Bounds x=\"1131.615\" y=\"13\" width=\"50\" height=\"50\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1157\" y=\"63\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_0d3r2hd_di\" bpmnElement=\"SequenceFlow_0d3r2hd\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"865\" y=\"314\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1083\" y=\"314\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1083\" y=\"38\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1132\" y=\"38\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1098\" y=\"176\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"EndEvent_1o0zvlx_di\" bpmnElement=\"EndEvent_1o0zvlx\"> <omgdc:Bounds x=\"1277.615\" y=\"295.846\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1296\" y=\"331.846\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNShape id=\"Task_11lrdnd_di\" bpmnElement=\"Task_11lrdnd\"> <omgdc:Bounds x=\"1386.615\" y=\"-2\" width=\"100\" height=\"80\" /> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_0a2moze_di\" bpmnElement=\"SequenceFlow_0a2moze\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1182\" y=\"38\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1387\" y=\"38\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1261\" y=\"20\" width=\"44\" height=\"14\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNShape id=\"EndEvent_0vzssxe_di\" bpmnElement=\"EndEvent_0vzssxe\"> <omgdc:Bounds x=\"1419\" y=\"296\" width=\"36\" height=\"36\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1437\" y=\"332\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNShape> <bpmndi:BPMNEdge id=\"SequenceFlow_1x8yqxg_di\" bpmnElement=\"SequenceFlow_1x8yqxg\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1437\" y=\"78\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1437\" y=\"296\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1452\" y=\"187\" width=\"0\" height=\"0\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> <bpmndi:BPMNEdge id=\"SequenceFlow_1ckerms_di\" bpmnElement=\"SequenceFlow_1ckerms\"> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1157\" y=\"63\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1157\" y=\"314\" /> <omgdi:waypoint xsi:type=\"omgdc:Point\" x=\"1278\" y=\"314\" /> <bpmndi:BPMNLabel> <omgdc:Bounds x=\"1191\" y=\"296.5\" width=\"50\" height=\"14\" /> </bpmndi:BPMNLabel> </bpmndi:BPMNEdge> </bpmndi:BPMNPlane> <bpmndi:BPMNLabelStyle id=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\"> <omgdc:Font name=\"Arial\" size=\"11\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> <bpmndi:BPMNLabelStyle id=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\"> <omgdc:Font name=\"Arial\" size=\"12\" isBold=\"false\" isItalic=\"false\" isUnderline=\"false\" isStrikeThrough=\"false\" /> </bpmndi:BPMNLabelStyle> </bpmndi:BPMNDiagram> </definitions>"

  importXML(diagramXML);

})(window.BpmnJS, window.jQuery);