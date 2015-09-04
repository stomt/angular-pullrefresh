# angular-pullrefresh [![Dependency Status](https://gemnasium.com/stomt/angular-pullrefresh.svg)](https://gemnasium.com/stomt/angular-pullrefresh)

This implementation relies heavily on [web-pull-to-refresh](https://github.com/apeatling/web-pull-to-refresh) and mostly just wraps that library in an angular directive.

It depends on **no other** library and is only **6 KB** big to fit in every project.


## API

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

## Development 

We use gulp to convert our code:
```sh
npm install -g bower gulp
npm install
bower install
gulp
```

## Contributing

Please submit all pull requests the against **master branch**. Thanks!


## Authors

**Simon Schmidt** (stomt)

+ https://github.com/alarie

**Max Klenk** (stomt)

+ http://github.com/maxklenk

## Copyright and license

	The MIT License

	Copyright (c) 2015 Simon Schmidt, Max Klenk

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.


  
