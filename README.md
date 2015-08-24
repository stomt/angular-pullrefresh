# angular-pullrefresh


This implementation relies heavily on [web-pull-to-refresh](https://github.com/apeatling/web-pull-to-refresh) 
and mostly just wraps that library in an angular directive.

It depends on [hammer.js](http://hammerjs.github.io/) - [angular-hammer](https://github.com/RyanMullins/angular-hammer) to be precise.


# API

The directive may take various attributes:

`pullrefresh: Function` The callback to be executed upon refresh. 
This attribute is required as it's the directive itself.

`pullrefresh-loader-style: String` The name of the variable that will hold the 
translation of the loader information as styles. Apply this to the ng-style 
attribute of an element to make use of it outside of the directive.


`pullrefresh-hide-loader: Boolean` Weather or not to hide the default loader. 
When you decide to hide the default loader, you should provide a custom 
implementation of it. The default loader looks like this:
  

    <div ng-style="ptrStyle" class="ptr">
        <span class="genericon genericon-next"></span>

        <div class="loading">
            <span class="l1"></span>
            <span class="l2"></span>
            <span class="l3"></span>
        </div>
    </div>

If you use the custom loader, you can make use of `pullrefresh-loader-style` to 
apply the loaders transformations to your custom loader.


`pullrefresh-content-offset: Number` The offset of the content from top. 
This offset is used to give the loader some space while reloading. By default the
height of the loader is used for this. If you use a custom loader you may want to 
override the default by specifying an offset in pixels here.


  
