module.exports=
{
    name:"twitter", 
    "triggers":{}, 
    "actions":[
        {
            name:"Post a tweet", 
            fields:[{ name:"status", displayName:"What's Happening ?"}, {name:"media", displayName:"Media"}], 
            delegate:function(fields){
            }
        }
    ]        
}