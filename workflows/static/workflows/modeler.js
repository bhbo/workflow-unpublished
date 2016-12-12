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


    var saveButton = document.querySelector('#saveXML-button');
    saveButton.addEventListener('click', function(){
        bpmnModeler.saveXML({ format: true }, function(err, xml) {
         if (err) {
          console.error('diagram save failed', err);
        } else {
          console.info('diagram saved');
          //console.info(xml);
          $.ajax({
    		url: "modeler/",
			type:"POST",
			data: {userXml:xml}
		  }).done(function(data){
			 location.href = "/workflows/";
		  });
		 }
		});
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
  saveAs(blob, "diagram-xml.txt");
        }
    });
    });
  }


  // a diagram to display
  //
  // see index-async.js on how to load the diagram asynchronously from a url.
  // (requires a running webserver)
  var diagramXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"\r\n             xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\"\r\n             xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\"\r\n             xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\"\r\n             xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\r\n             expressionLanguage=\"http://www.w3.org/1999/XPath\"\r\n             typeLanguage=\"http://www.w3.org/2001/XMLSchema\"\r\n             targetNamespace=\"\"\r\n             xsi:schemaLocation=\"http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd\">\r\n<collaboration id=\"sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424\">\r\n    <participant id=\"sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F\" name=\"Student\" processRef=\"sid-C3803939-0872-457F-8336-EAE484DC4A04\">\r\n    </participant>\r\n</collaboration>\r\n<process id=\"sid-C3803939-0872-457F-8336-EAE484DC4A04\" isClosed=\"false\" isExecutable=\"false\" name=\"Student\" processType=\"None\">\r\n    <extensionElements/>\r\n    <laneSet id=\"sid-b167d0d7-e761-4636-9200-76b7f0e8e83a\">\r\n        <lane id=\"sid-57E4FE0D-18E4-478D-BC5D-B15164E93254\">\r\n            <flowNodeRef>sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138</flowNodeRef>\r\n            <flowNodeRef>sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26</flowNodeRef>\r\n            <flowNodeRef>SCAN_OK</flowNodeRef>\r\n            <flowNodeRef>sid-E49425CF-8287-4798-B622-D2A7D78EF00B</flowNodeRef>\r\n            <flowNodeRef>sid-E433566C-2289-4BEB-A19C-1697048900D2</flowNodeRef>\r\n            <flowNodeRef>sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9</flowNodeRef>\r\n        </lane>\r\n    </laneSet>\r\n    <startEvent id=\"sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138\" name=\"Notices&#10;QR code\">\r\n        <outgoing>sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD</outgoing>\r\n    </startEvent>\r\n    <task completionQuantity=\"1\" id=\"sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26\" isForCompensation=\"false\" name=\"Scan QR code\" startQuantity=\"1\">\r\n        <incoming>sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D</incoming>\r\n        <outgoing>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</outgoing>\r\n    </task>\r\n    <exclusiveGateway gatewayDirection=\"Diverging\" id=\"SCAN_OK\" name=\"Scan successful?&#10;\">\r\n        <incoming>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</incoming>\r\n        <outgoing>sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB</outgoing>\r\n        <outgoing>sid-337A23B9-A923-4CCE-B613-3E247B773CCE</outgoing>\r\n    </exclusiveGateway>\r\n    <task completionQuantity=\"1\" id=\"sid-E49425CF-8287-4798-B622-D2A7D78EF00B\" isForCompensation=\"false\" name=\"Open product information in mobile  app\" startQuantity=\"1\">\r\n        <incoming>sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB</incoming>\r\n        <outgoing>sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C</outgoing>\r\n    </task>\r\n    <endEvent id=\"sid-E433566C-2289-4BEB-A19C-1697048900D2\" name=\"Is informed\">\r\n        <incoming>sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C</incoming>\r\n    </endEvent>\r\n    <exclusiveGateway gatewayDirection=\"Converging\" id=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9\">\r\n        <incoming>sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD</incoming>\r\n        <incoming>sid-337A23B9-A923-4CCE-B613-3E247B773CCE</incoming>\r\n        <outgoing>sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D</outgoing>\r\n    </exclusiveGateway>\r\n    <sequenceFlow id=\"sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD\" sourceRef=\"sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138\" targetRef=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9\"/>\r\n    <sequenceFlow id=\"sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A\" sourceRef=\"sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26\" targetRef=\"SCAN_OK\"/>\r\n    <sequenceFlow id=\"sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C\" sourceRef=\"sid-E49425CF-8287-4798-B622-D2A7D78EF00B\" targetRef=\"sid-E433566C-2289-4BEB-A19C-1697048900D2\"/>\r\n    <sequenceFlow id=\"sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB\" name=\"No\" sourceRef=\"SCAN_OK\" targetRef=\"sid-E49425CF-8287-4798-B622-D2A7D78EF00B\"/>\r\n    <sequenceFlow id=\"sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D\" sourceRef=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9\" targetRef=\"sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26\"/>\r\n    <sequenceFlow id=\"sid-337A23B9-A923-4CCE-B613-3E247B773CCE\" name=\"Yes\" sourceRef=\"SCAN_OK\" targetRef=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9\"/>\r\n</process>\r\n<bpmndi:BPMNDiagram id=\"sid-74620812-92c4-44e5-949c-aa47393d3830\">\r\n    <bpmndi:BPMNPlane bpmnElement=\"sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424\" id=\"sid-cdcae759-2af7-4a6d-bd02-53f3352a731d\">\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F\" id=\"sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F_gui\" isHorizontal=\"true\">\r\n            <omgdc:Bounds height=\"250.0\" width=\"933.0\" x=\"42.5\" y=\"75.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\">\r\n                <omgdc:Bounds height=\"59.142852783203125\" width=\"12.000000000000014\" x=\"47.49999999999999\" y=\"170.42857360839844\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-57E4FE0D-18E4-478D-BC5D-B15164E93254\" id=\"sid-57E4FE0D-18E4-478D-BC5D-B15164E93254_gui\" isHorizontal=\"true\">\r\n            <omgdc:Bounds height=\"250.0\" width=\"903.0\" x=\"72.5\" y=\"75.0\"/>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138\" id=\"sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138_gui\">\r\n            <omgdc:Bounds height=\"30.0\" width=\"30.0\" x=\"150.0\" y=\"165.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n                <omgdc:Bounds height=\"22.0\" width=\"46.35714340209961\" x=\"141.8214282989502\" y=\"197.0\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26\" id=\"sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26_gui\">\r\n            <omgdc:Bounds height=\"80.0\" width=\"100.0\" x=\"352.5\" y=\"140.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\">\r\n                <omgdc:Bounds height=\"12.0\" width=\"84.0\" x=\"360.5\" y=\"172.0\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"SCAN_OK\" id=\"SCAN_OK_gui\" isMarkerVisible=\"true\">\r\n            <omgdc:Bounds height=\"40.0\" width=\"40.0\" x=\"550.0\" y=\"160.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n                <omgdc:Bounds height=\"12.0\" width=\"102.0\" x=\"521.0\" y=\"127.0\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-E49425CF-8287-4798-B622-D2A7D78EF00B\" id=\"sid-E49425CF-8287-4798-B622-D2A7D78EF00B_gui\">\r\n            <omgdc:Bounds height=\"80.0\" width=\"100.0\" x=\"687.5\" y=\"140.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\">\r\n                <omgdc:Bounds height=\"36.0\" width=\"83.14285278320312\" x=\"695.9285736083984\" y=\"162.0\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-E433566C-2289-4BEB-A19C-1697048900D2\" id=\"sid-E433566C-2289-4BEB-A19C-1697048900D2_gui\">\r\n            <omgdc:Bounds height=\"28.0\" width=\"28.0\" x=\"865.0\" y=\"166.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n                <omgdc:Bounds height=\"11.0\" width=\"62.857147216796875\" x=\"847.5714263916016\" y=\"196.0\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNShape bpmnElement=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9\" id=\"sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9_gui\" isMarkerVisible=\"true\">\r\n            <omgdc:Bounds height=\"40.0\" width=\"40.0\" x=\"240.0\" y=\"160.0\"/>\r\n        </bpmndi:BPMNShape>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A\" id=\"sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A_gui\">\r\n            <omgdi:waypoint x=\"452.5\" y=\"180\"/>\r\n            <omgdi:waypoint x=\"550.0\" y=\"180\"/>\r\n        </bpmndi:BPMNEdge>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB\" id=\"sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB_gui\">\r\n            <omgdi:waypoint x=\"590.0\" y=\"180\"/>\r\n            <omgdi:waypoint x=\"687.5\" y=\"180\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n                <omgdc:Bounds height=\"12.048704338048935\" width=\"16.32155963195521\" x=\"597.8850936986571\" y=\"155\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNEdge>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD\" id=\"sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD_gui\">\r\n            <omgdi:waypoint x=\"180.0\" y=\"180\"/>\r\n            <omgdi:waypoint x=\"240.0\" y=\"180\"/>\r\n        </bpmndi:BPMNEdge>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D\" id=\"sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D_gui\">\r\n            <omgdi:waypoint x=\"280.0\" y=\"180\"/>\r\n            <omgdi:waypoint x=\"352.5\" y=\"180\"/>\r\n        </bpmndi:BPMNEdge>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C\" id=\"sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C_gui\">\r\n            <omgdi:waypoint x=\"787.5\" y=\"180.0\"/>\r\n            <omgdi:waypoint x=\"865.0\" y=\"180.0\"/>\r\n        </bpmndi:BPMNEdge>\r\n        <bpmndi:BPMNEdge bpmnElement=\"sid-337A23B9-A923-4CCE-B613-3E247B773CCE\" id=\"sid-337A23B9-A923-4CCE-B613-3E247B773CCE_gui\">\r\n            <omgdi:waypoint x=\"570.5\" y=\"200.0\"/>\r\n            <omgdi:waypoint x=\"570.5\" y=\"269.0\"/>\r\n            <omgdi:waypoint x=\"260.5\" y=\"269.0\"/>\r\n            <omgdi:waypoint x=\"260.5\" y=\"200.0\"/>\r\n            <bpmndi:BPMNLabel labelStyle=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n                <omgdc:Bounds height=\"21.4285888671875\" width=\"12.0\" x=\"550\" y=\"205\"/>\r\n            </bpmndi:BPMNLabel>\r\n        </bpmndi:BPMNEdge>\r\n    </bpmndi:BPMNPlane>\r\n    <bpmndi:BPMNLabelStyle id=\"sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581\">\r\n        <omgdc:Font isBold=\"false\" isItalic=\"false\" isStrikeThrough=\"false\" isUnderline=\"false\" name=\"Arial\" size=\"11.0\"/>\r\n    </bpmndi:BPMNLabelStyle>\r\n    <bpmndi:BPMNLabelStyle id=\"sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b\">\r\n        <omgdc:Font isBold=\"false\" isItalic=\"false\" isStrikeThrough=\"false\" isUnderline=\"false\" name=\"Arial\" size=\"12.0\"/>\r\n    </bpmndi:BPMNLabelStyle>\r\n</bpmndi:BPMNDiagram>\r\n</definitions>\r\n\r\n";

  // import xml
  importXML(diagramXML);

})(window.BpmnJS, window.jQuery);