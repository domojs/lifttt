module.exports={
    name:"script",
    "triggers":[], 
    "actions":
    [
        {
            name:"run", 
            fields:
            [
                {name:"script", displayName:"the path of the script to run"}, 
                {name:"function", displayName:"the function to call in the script"},
                {name:"args", displayName:"the parameters to pass to the function"}
            ],
            delegate:function(fields){
                var result= function(fields){
                    if(!fields.function)
                            $('child_process').fork(fields.script).on('end', function(){
                                console.log('completed');
                            });
                        else
                        {
                            var script=$(fields.script);
                            if(script[fields.function])
                            {
                                console.log('value: '+fields.args);
                                console.log('type: '+typeof(fields.args));
                                if(fields.args=='undefined' || !fields.args)
                                {
                                    console.log('Calling '+fields.function+' in '+fields.script);
                                    script[fields.function]();
                                }
                                else
                                {
                                    console.log('Calling '+fields.function+' in '+fields.script+' with '+fields.args);
                                    script[fields.function].call(null,fields.args);
                                }
                            }
                            else
                                console.log('could not call '+fields.function+' because it could not be found in '+fields.script);
                        }
                };
                result.fields=fields;
                return result;
            }
        }
    ]
};