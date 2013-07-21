module.exports={name:"console", "triggers":[{name:"scan",fields:[{name:"hidraw", displayName:"Which input should be watched"}], when:function(fields,callback){
	var barcode='';

	$('fs').createReadStream(fields.hidraw).on('data', function(data){			
			for(var i in data)
			{
				var digit=-1;
				switch(data[i])
				{
					case 0x27:
						barcode+='0';
						break;
					case 0x26:
					case 0x25:
					case 0x24:
					case 0x23:
					case 0x22:
					case 0x21:
					case 0x20:
					case 0x1F:
					case 0x1E:
						barcode+=''+data[i]-0x1D;
						break;
					case 0x28:
						callback({data:barcode});
						barcode='';
						break;
				}
			}
		});
	}
}], "actions":[]}