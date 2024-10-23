
define(["/lib/html2pdf.bundle.min.js"
    ], function(html2pdf) {
    return {
		parcelpopup_to_pdf: function(){		
			var element = document.getElementById('drill_list');
			var opt = {
				margin:       1,
				filename:     'durham_maps_export.pdf',
				image:        { type: 'jpeg', quality: 0.98 },
				html2canvas:  { dpi: 192, letterRendering: true, foreignObjectRendering: false },
				jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
			};
			html2pdf().set(opt).from(element).save();

		}
		};
});