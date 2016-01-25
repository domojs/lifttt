exports.restart = exports.quit = function(){
    process.emit('preexit');
    process.exit();
    console.log('restarting');
};
exports.preventNextOccurence=function(name){
    process.preventNextOccurrences.push(name);
};

exports.enable=function(name)
{
    var recipes=$('./recipes.json');
    var matchingRecipes=$.grep(recipes, function(recipe){ return recipe.name==name; });
    $.each(matchingRecipes, function(index, recipe){ recipe.disabled=false; });
    $('fs').writeFileSync("./recipes.json", JSON.stringify(recipes));
    exports.restart();
};

exports.disable=function(name)
{
    var recipes=$('./recipes.json');
    var matchingRecipes=$.grep(recipes, function(recipe){ return recipe.name==name ; });
    $.each(matchingRecipes, function(index, recipe){ recipe.disabled=true; });
    $('fs').writeFileSync("./recipes.json", JSON.stringify(recipes));
    exports.restart();
};

exports.mode=function(mode)
{
    console.log('setting mode to '+mode);
    global.ifttt.mode=mode;
};