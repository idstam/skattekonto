var pageLoaded = function () {
	document.getElementById('inputData').focus()
}
var handleInput = function () {
	var vouchers = parseInput();
	renderVouchers(vouchers);
}

var renderVouchers = function(vouchers){
	var result = "";
	var table = document.getElementById("outTable")

	vouchers.forEach(function(voucher) {
		var tr = document.createElement("tr")
		datum = document.createElement("td")
		debit = document.createElement("td")
		kredit = document.createElement("td")
		amount = document.createElement("td")
		spec = document.createElement("td")

		amount.setAttribute("align", "right")
		
		datum.appendChild(document.createTextNode(voucher.date))
		debit.appendChild(document.createTextNode(voucher.debit))
		kredit.appendChild(document.createTextNode(voucher.kredit))
		amount.appendChild(document.createTextNode(voucher.amount))
		spec.appendChild(document.createTextNode(voucher.spec))
		tr.appendChild(datum)
		tr.appendChild(debit)
		tr.appendChild(kredit)
		tr.appendChild(amount)
		tr.appendChild(spec)
		table.appendChild(tr);
	});


}

var parseInput = function () {
	let dateLineExp = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/
	let arbetsgivarAvgiftExp = /rbetsgivaravgift/
	let momsExp = /Moms/
	let rtaExp = /ränta/
	let avgAExp = /Förs.avgift/
	let avgBExp = /Förseningsavgift/
	let inbetExp = /Inbetalning/
	let avdragenExp = /vdragen skatt/

	var inDate = false
	var curDate = "";
	var out = [];

	var data = document.getElementById('inputData').value;
	var lines = data.split('\n');
	var len = lines.length;

	for (i = 0; i < len; i++) {
		var line = lines[i];
		var tokens = line.split("\t");
		
		var voucher = {}

		if (inDate) {
			inDate = false;
			var amount = tokens[2].trim().replace("-", "");
			var isNegative = tokens[2].trim().startsWith("-");

			if(amount === ""){
				var amount = tokens[3].trim().replace("-", "");
				isNegative = tokens[3].trim().startsWith("-");
			}

			var spec = tokens[1].trim();
			if(inbetExp.test(line)){
				voucher = createVoucher(curDate, "1630", "1930", amount, spec);
				out.push(voucher);
				continue;
			}

			if(arbetsgivarAvgiftExp.test(line)){
				voucher = createVoucher(curDate, "2730", "1630", amount, spec);
				out.push(voucher);
				continue;
			}
			if(avdragenExp.test(line)){
				voucher = createVoucher(curDate, "2710", "1630", amount, spec);
				out.push(voucher);
				continue;
			}

			if(momsExp.test(line)){
				voucher = createVoucher(curDate, "1630", "1650", amount, spec);
				if(tokens[2].trim().startsWith("-")){
					voucher = createVoucher(curDate, "2650", "1630", amount, spec);
				}
				out.push(voucher);
				continue;
			}

			if(rtaExp.test(line)){
				if(isNegative){
					voucher = createVoucher(curDate, "8423", "1630", amount, spec);
				} else{
					voucher = createVoucher(curDate, "1630", "8314", amount, spec);
				}

				out.push(voucher);
				continue;
			}

			if(avgAExp.test(line) || avgBExp.test(line)){
				voucher = createVoucher(curDate, "6992", "1630", amount, spec)
				out.push(voucher);
				continue;
			}

			voucher = createVoucher(curDate, "UNKNOWN", "UNKNOWN", amount, line);
			out.push(voucher);
			
		} else {
			if (dateLineExp.test(line)) {
				curDate = line;
				inDate = true;
			}
		}
	}

	return out;
}

var createVoucher = function(vdate, dkonto, kkonto, amount, spec){
	var voucher = {}
	voucher.date = vdate
	voucher.debit = dkonto
	voucher.kredit = kkonto
	voucher.amount = amount
	voucher.spec = spec
	return voucher

}
var swapDebitKredit = function (inVoucher) {
	var outVoucher = {}
	outVoucher.date = inVoucher.date;
	outVoucher.debit = inVoucher.debit;
	outVoucher.kredit = inVoucher.kredit;
	outVoucher.amount = inVoucher.amount;
	outVoucher.spec = inVoucher.spec;
	return outVoucher;
}