# Meteor Markdown JS
A wrapper of [markdown-js](https://github.com/evilstreak/markdown-js)

## Usage
It provide a template helper `markdown` as same as official http://docs.meteor.com/#showdown, and a `window.markdown()`
> This package lets you use Markdown in your templates. It's easy: just put your markdown inside {{#markdown}} ... {{/markdown}} tags. You can still use all of the usual Meteor template features inside a Markdown block, such #each, and you still get reactivity.
> 
## Hooks
Since markdown-js presents an intermediate representation in JsonML, this package makes usage of this to present the user with several hooks that allow transforms to the structure.

Example: drop a file at the root of your meteor app like so:

```js
Meteor.startup(function(){
    markdown.register('before',function(content){
        console.log(content.data); //raw markdown string
    });
    markdown.register('json',function(content){
        console.log(content); //JsonML tree
    });
    markdown.register('html',function(content){
        console.log(content); //html json tree
    });
    markdown.register('after',function(content){
        console.log(content.data); //rendered html
    });
})
```

You can register multiple functions for the same hook, which can be practical to keep your plugins in separate functions. Each register() function returns a curryed version of itself, so you can chain hooks:

```js
Meteor.startup(function(){

    //turns [] into checkboxes
    var checkboxes = function(jsonml){
        if(jsonml[0] === "link_ref"){
            if(jsonml[2].length <2 && jsonml[2] == jsonml[1].ref && (!jsonml[2] || jsonml[2].match(/\s|x|\*|✓|✔|☑|x|×|X|✕|☓|✖|✗|✘/))){
                jsonml[0] = "label";
                var checked = false;
                var valid = true;
                if(jsonml[2]!=="" && jsonml[2]!==" "){
                    checked = true;
                }
                if(jsonml[2].match(/x|×|X|✕|☓|✖|✗|✘/)){
                    valid = false;
                }
                var checkbox = ["input",{type:"checkbox"}];
                if(checked){checkbox[1].checked = "checked";}
                if(!valid){checkbox[1].disabled = "disabled";}
                jsonml[1] = {class:'checkbox'};
                jsonml[2] = checkbox;
            }
        }
        else{
            var i = 1, l = jsonml.length;
            for(i;i<l;i++){
                if(Array.isArray(jsonml[i])){
                    checkboxes(jsonml[i]);
                }
            }
        }
    }

    //turns @something and #something into links
    var mentionRegExp = /([@#][A-Za-z0-9][A-Za-z0-9_]{0,40})/g;
    var mention = function(jsonml){
        var i, l, ret;
        if(typeof jsonml == 'string'){
            if(jsonml.match(mentionRegExp)){
                jsonml = jsonml.split(mentionRegExp);
                ret = ['para'];
                for(i=0,l=jsonml.length;i<l;i++){
                    if(!jsonml[i] || !jsonml[i].length){continue;}
                    var type = (jsonml[i][0]=='@'?'mention':'hashtag');
                    if(jsonml[i][0].match(/@|#/)){
                        jsonml[i] = ['a'
                        ,   {
                                class:type
                            ,   href:type+'/'+jsonml[i].substr(1)
                            }
                        ,   jsonml[i]
                        ];
                    }
                    ret.push(jsonml[i]);
                }
                return ret;
            }
        }
        else{
            for(i=0,l=jsonml.length;i<l;i++){
                ret = mention(jsonml[i]);
                if(ret){jsonml[i] = ret;}
            }
        }
    }

    markdown.register('json')(checkboxes)(mention)
});
```