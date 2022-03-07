/*
Matt Reames, 2019
This module loads the html2pdf library and specifies some PDF outputs
*/
define(["/lib/html2pdf.bundle.min.js"
    ], function(html2pdf) {
    return {
		
			parcelpopup_to_pdf: function(){			
				var element = document.getElementById('drill_list_ul');
				var opt = {
					margin:       1,
					filename:     'durham_maps_export.pdf',
					image:        { type: 'jpeg', quality: 0.98 },
					html2canvas:  { dpi: 192, letterRendering: true, foreignObjectRendering: false },
					jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
				};
				html2pdf().from(element).set(opt).save();
			}
		};
});