'use strict';

var SingleSelleckt = require('../lib/SingleSelleckt');

var $ = require('jquery');
var _ = require('underscore');
var Mustache = require('Mustache');

describe('SingleSelleckt', function(){
    var selleckt,
        mainTemplate =
            '<div class="{{className}}">' +
            '<div class="selected">' +
                '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
            '</div>' +
            '<ul class="items">' +
                '{{#items}}' +
                '<li class="item{{#selected}} selected{{/selected}}" data-value="{{value}}">' +
                    '{{label}}' +
                '</li>' +
                '{{/items}}' +
            '</ul>' +
            '</div>',
        elHtml =
            '<select>' +
                '<option selected value="1">foo</option>' +
                '<option value="2" data-meh="whee" data-bah="oink">bar</option>' +
                '<option value="3">baz</option>' +
            '</select>',
        $el;

    beforeEach(function(){
        $el = $(elHtml).appendTo('body');
    });

    afterEach(function(){
        $el.remove();
        $el = undefined;

        if(selleckt){
            selleckt.destroy();
            selleckt = undefined;
        }
    });

    describe('Instantiation', function(){
        var template =
            '<div class="{{className}}" tabindex=1>' +
                '<div class="selected">' +
                    '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                '</div>' +
                '<ul class="items">' +
                    '{{#showSearch}}' +
                    '<li class="searchContainer">' +
                        '<input class="search"></input>' +
                    '</li>' +
                    '{{/showSearch}}' +
                    '{{#items}}' +
                        '{{> item}}' +
                    '{{/items}}' +
                '</ul>' +
            '</div>',
            itemTemplate = '<li class="{{itemClass}}" data-text="{{label}}" data-value="{{value}}">' +
                '<span class="{{itemTextClass}}">{{label}}</span>' +
            '</li>';

        describe('invalid instantiation', function(){
            it('pukes if instantiated with an invalid template format', function(){
                var err;

                try{
                    selleckt = new SingleSelleckt({
                        mainTemplate : {template: template},
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClassName: 'isHighlighted'
                    });
                } catch(e){
                    err = e;
                }

                expect(err).toBeDefined();
                expect(err.message).toEqual('Please provide a valid mustache template.');
            });

        });

        describe('valid instantation', function(){

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    mainTemplate: template,
                    itemTemplate: itemTemplate,
                    $selectEl : $el,
                    className: 'selleckt',
                    selectedClass: 'selected',
                    selectedTextClass: 'selectedText',
                    itemsClass: 'items',
                    itemClass: 'item',
                    selectedClassName: 'isSelected',
                    highlightClass: 'isHighlighted'
                });
            });

            it('stores the selectedClass as this.selectedClass', function(){
                expect(selleckt.selectedClass).toEqual('selected');
            });

            it('stores the selectedTextClass as this.selectedClass', function(){
                expect(selleckt.selectedTextClass).toEqual('selectedText');
            });

            it('stores the itemsClass as this.itemsClass', function(){
                expect(selleckt.itemsClass).toEqual('items');
            });

            it('stores the itemClass as this.itemClass', function(){
                expect(selleckt.itemClass).toEqual('item');
            });

            it('stores options.mainTemplate as this.template', function(){
                expect(Mustache.render(selleckt.mainTemplate, {})).toEqual(Mustache.render(template, {}));
            });

            it('stores options.itemTemplate as this.itemTemplate', function(){
                expect(Mustache.render(selleckt.itemTemplate, {})).toEqual(Mustache.render(itemTemplate, {}));
            });

            it('stores options.mainTemplateData as this.mainTemplateData', function(){
                expect(selleckt.mainTemplateData).toEqual({});
            });

            it('stores options.selectEl as this.originalSelectEl', function(){
                expect(selleckt.$originalSelectEl).toEqual($el);
            });

            it('stores options.className as this.className', function(){
                expect(selleckt.className).toEqual('selleckt');
            });

            it('stores options.highlightClass as this.highlightClass', function(){
                expect(selleckt.highlightClass).toEqual('isHighlighted');
            });

            describe('items', function(){
                it('instantiates this.items as an based on the options in the original select', function(){
                    expect(selleckt.items.length).toEqual(3);
                });
                it('stores the option text as "label"', function(){
                    expect(selleckt.items[0].label).toEqual('foo');
                    expect(selleckt.items[1].label).toEqual('bar');
                });
                it('stores the option value as "value"', function(){
                    expect(selleckt.items[0].value).toEqual('1');
                    expect(selleckt.items[1].value).toEqual('2');
                });
                it('stores all the option data attributes in "data"', function(){
                    expect(selleckt.items[0].data).toBeDefined();
                    expect(_.size(selleckt.items[0].data)).toEqual(0);

                    expect(selleckt.items[1].data).toBeDefined();
                    expect(_.size(selleckt.items[1].data)).toEqual(2);
                    expect(selleckt.items[1].data).toEqual({
                        meh: 'whee',
                        bah: 'oink'
                    });
                });
                it('stores the selected option as this.selectedItem', function(){
                    expect(selleckt.selectedItem).toBeDefined();
                    expect(selleckt.selectedItem).toEqual({
                        value: '1',
                        label: 'foo',
                        data: {}
                    });
                });

                describe('when there is no selected item already', function(){
                    var $newEl;

                    beforeEach(function(){
                        var selectHtml = '<select>' +
                        '<option value="1">foo</option>' +
                        '<option value="2">bar</option>' +
                        '<option value="3">baz</option>' +
                        '</select>';

                        selleckt.destroy();

                        $newEl = $(selectHtml).appendTo('body');

                        selleckt = new SingleSelleckt({
                            mainTemplate: template,
                            $selectEl : $newEl,
                            className: 'selleckt',
                            selectedClass: 'selected',
                            selectedTextClass: 'selectedText',
                            itemsClass: 'items',
                            itemClass: 'item',
                            selectedClassName: 'isSelected',
                            highlightClass: 'isHighlighted'
                        });
                    });

                    afterEach(function(){
                        $newEl.remove();
                        $newEl = undefined;
                    });

                    it('does not select an item', function(){
                        expect(selleckt.selectedItem).toBeUndefined();
                    });
                });
            });

            describe('events', function(){
                it('does not trigger change event when instantiated on select with selected option', function(){
                    var onChangeStub = sinon.stub();
                    $el.on('change', onChangeStub);

                    selleckt = new SingleSelleckt({
                        mainTemplate: template,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClass: 'isHighlighted'
                    });

                    expect(onChangeStub.called).toEqual(false);
                    $el.off('change', onChangeStub);
                });
            });

            describe('template formats', function(){
                it('accepts template strings', function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $el,
                        className: 'selleckt',
                        selectedClass: 'selected',
                        selectedTextClass: 'selectedText',
                        itemsClass: 'items',
                        itemClass: 'item',
                        selectedClassName: 'isSelected',
                        highlightClassName: 'isHighlighted'
                    });
                    selleckt.render();
                    expect(selleckt.$sellecktEl.find('.items').length).toEqual(1);
                    expect(selleckt.$sellecktEl.find('.items > .item').length).toEqual(3);
                });
            });

            describe('template data', function(){
                it('can build template data object from custom data and plugin data', function(){
                    var templateData;

                    selleckt = new SingleSelleckt({
                        $selectEl : $el,
                        enableSearch: true,
                        className: 'selleckt',
                        mainTemplateData: {
                            selectLabel: 'Please selleckt',
                            required: false
                        }
                    });

                    templateData = selleckt.getTemplateData();

                    expect(templateData.showSearch).toEqual(true);
                    expect(templateData.selectedItemText).toEqual('foo');
                    expect(templateData.className).toEqual('selleckt');
                    expect(templateData.items).toBeDefined();
                    expect(templateData.items.length).toEqual(3);
                    expect(templateData.selectLabel).toEqual('Please selleckt');
                    expect(templateData.required).toEqual(false);
                });

                it('prevents custom data from overriding plugin data', function(){
                    var templateData;

                    selleckt = new SingleSelleckt({
                        $selectEl : $el,
                        mainTemplateData: {
                            selectLabel: 'Please selleckt',
                            required: false,
                            showSearch: 'yes',
                            items: []
                        }
                    });

                    templateData = selleckt.getTemplateData();

                    expect(templateData.selectLabel).toEqual('Please selleckt');
                    expect(templateData.required).toEqual(false);
                    expect(templateData.showSearch).toEqual(false);
                    expect(templateData.items).toBeDefined();
                    expect(templateData.items.length).toEqual(3);
                });
                it('includes user configurable class names in template data', function(){
                    var templateData;

                    selleckt = new SingleSelleckt({
                        $selectEl: $el,
                        className: 'sellecktTest',
                        selectedClass: 'trigger',
                        selectedTextClass: 'triggerText',
                        itemsClass: 'dropdown',
                        itemslistClass: 'options',
                        itemClass: 'option',
                        itemTextClass: 'optionText',
                        searchInputClass: 'searchBox'
                    });

                    templateData = selleckt.getTemplateData();

                    expect(templateData.className).toEqual('sellecktTest');
                    expect(templateData.selectedClass).toEqual('trigger');
                    expect(templateData.selectedTextClass).toEqual('triggerText');
                    expect(templateData.itemsClass).toEqual('dropdown');
                    expect(templateData.itemslistClass).toEqual('options');
                    expect(templateData.itemClass).toEqual('option');
                    expect(templateData.itemTextClass).toEqual('optionText');
                    expect(templateData.searchInputClass).toEqual('searchBox');
                });
            });
        });

        describe('rendering', function(){
            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });
            it('renders the selected element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selected').length).toEqual(1);
            });
            it('renders the selected text element based on this.template', function(){
                expect(selleckt.$sellecktEl.find('.selectedText').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.selectedText').text()).toEqual(selleckt.selectedItem.label);
            });
            it('renders the items correctly', function(){
                expect(selleckt.$sellecktEl.find('.itemslist').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('.itemslist > .item').length).toEqual(3);
            });
            it('hides the original Select element', function(){
                expect(selleckt.$originalSelectEl.css('display')).toEqual('none');
            });
            it('adds a class of "closed" to the element', function(){
                expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);
            });
            it('replaces custom template tags with template data', function(){
                var customTemplate =
                    '<div class="{{className}}">' +
                        '{{#selectLabel}}<label>{{selectLabel}}</label>{{/selectLabel}}' +
                        '{{#required}}<span class="required">*</span>{{/required}}' +
                        '<div class="selected">' +
                            '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                        '</div>' +
                        '<ul class="items">' +
                            '{{#items}}' +
                            '<li class="item{{#selected}} selected{{/selected}}" data-value="{{value}}">' +
                                '{{label}}' +
                            '</li>' +
                            '{{/items}}' +
                        '</ul>' +
                    '</div>';

                selleckt.destroy();
                selleckt = new SingleSelleckt({
                    $selectEl : $el,
                    mainTemplate: customTemplate,
                    mainTemplateData: {
                        selectLabel: 'Please selleckt',
                        required: false
                    }
                });
                selleckt.render();

                expect(selleckt.$sellecktEl.find('label').length).toEqual(1);
                expect(selleckt.$sellecktEl.find('label').text()).toEqual('Please selleckt');
                expect(selleckt.$sellecktEl.find('.required').length).toEqual(0);
            });
            it('can determine closest $scrollingParent in DOM', function(){
                selleckt.destroy();

                $('body').css('overflow-y', 'scroll');

                selleckt = new SingleSelleckt({
                    mainTemplate : mainTemplate,
                    $selectEl : $el
                });
                selleckt.render();

                expect(selleckt.$scrollingParent.length).toEqual(1);
                expect(selleckt.$scrollingParent.is('body')).toEqual(true);

                $('body').css('overflow-y', 'visible');
            });
            it('returns window as $scrollingParent if no other scrolling parent is in DOM', function(){
                expect(selleckt.$scrollingParent.length).toEqual(1);
                expect(selleckt.$scrollingParent).toEqual($(window));
            });
            it('can determine closest $overflowHiddenParent in DOM', function(){
                selleckt.destroy();

                $('body').css({
                    'overflow-y': 'hidden',
                    'max-height': '1000px'
                });

                selleckt = new SingleSelleckt({
                    mainTemplate : mainTemplate,
                    $selectEl : $el
                });
                selleckt.render();

                expect(selleckt.$overflowHiddenParent.length).toEqual(1);
                expect(selleckt.$overflowHiddenParent.is('body')).toEqual(true);

                $('body').css({
                    'overflow-y': 'visible',
                    'max-height': 'auto'
                });
            });
            it('returns "undefined" if no other $overflowHiddenParent is in DOM', function(){
                expect(selleckt.$overflowHiddenParent).toBeUndefined();
            });
        });

        describe('Adding items', function(){
            var item;
            var waitTime = 100;

            beforeEach(function(){
                item = {
                    label: 'new',
                    value: 'new value'
                };

                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            afterEach(function(){
                selleckt.destroy();
                selleckt = undefined;
            });

            describe('using addItem to add a single item', function(){
                it('adds an item to this.items', function(){
                    expect(selleckt.items.length).toEqual(3);

                    selleckt.addItem(item);

                    expect(selleckt.items.length).toEqual(4);
                    expect(selleckt.items[3]).toEqual(item);
                });

                it('appends a new option to the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);

                    selleckt.addItem(item);

                    expect($originalSelectEl.children().length).toEqual(4);

                    var newOption = $originalSelectEl.find('option').eq(3);

                    expect(newOption.text()).toEqual('new');
                    expect(newOption.val()).toEqual('new value');
                });

                it('appends a new item to the Selleckt element itself', function(done){
                    var $sellecktEl = selleckt.$sellecktEl;
                    var itemClass = '.' + selleckt.itemClass;

                    expect($sellecktEl.find(itemClass).length).toEqual(3);

                    selleckt.addItem(item);

                    //because of the dom event
                    setTimeout(function(){
                        expect($sellecktEl.find(itemClass).length).toEqual(4);
                        done();
                    }, waitTime);
                });

                it('selects the new item when it is clicked', function(done){
                    var $sellecktEl = selleckt.$sellecktEl;

                    selleckt.addItem(item);

                    setTimeout(function(){
                        $sellecktEl.trigger('click');
                        $sellecktEl.find('li.item').eq(3).trigger('mouseover').trigger('click');

                        expect(selleckt.selectedItem.label).toEqual('new');
                        expect(selleckt.selectedItem.value).toEqual('new value');

                        var $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);

                        expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('new');

                        done();
                    }, waitTime);
                });

                describe('and the new item has selected:true', function(){
                    var originalSelection;

                    beforeEach(function(){
                        originalSelection = selleckt.$originalSelectEl.find('option:selected');
                        item.isSelected = true;
                    });

                    it('selects the new item in the original select', function(done){
                        expect(originalSelection.val()).toEqual('1');

                        selleckt.addItem(item);

                        var newSelection = selleckt.$originalSelectEl.find('option:selected');

                        setTimeout(function(){
                            expect(newSelection.length).toEqual(1);
                            expect(newSelection.val()).toEqual('new value');
                            done();
                        }, waitTime);
                    });

                    it('selects the new item in Selleckt', function(done){
                        var $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);

                        expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('foo');

                        selleckt.addItem(item);

                        setTimeout(function(){
                            expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('new');
                            done();
                        }, waitTime);
                    });

                    it('hides the new item from the Selleckt list', function(done){
                        expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                        selleckt.addItem(item);

                        setTimeout(function(){
                            expect(selleckt.$items.find('.item[data-value="new value"]').css('display')).toEqual('none');
                            done();
                        }, waitTime);
                    });

                    it('adds the previously selected item back to the Selleckt list', function(done){
                        expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                        selleckt.addItem(item);

                        setTimeout(function(){
                            expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('list-item');
                            done();
                        }, waitTime);
                    });

                    it('deselects the previously selected item in the Selleckt', function(done){
                        expect(selleckt.selectedItem.value).toEqual('1');
                        expect(selleckt.selectedItem.label).toEqual('foo');

                        selleckt.addItem(item);

                        setTimeout(function(){
                            expect(selleckt.selectedItem.value).toEqual('new value');
                            expect(selleckt.selectedItem.label).toEqual('new');
                            done();
                        }, waitTime);
                    });
                });
            });

            describe('using addItems to add an array of items', function(){
                var items;

                beforeEach(function(){
                    items = [
                        { label: 'new 1', value: 'new value 1' },
                        { label: 'new 2', value: 'new value 2' },
                        { label: 'new 3', value: 'new value 3' }
                    ];
                });

                afterEach(function(){
                    items = undefined;
                });

                it('adds the items to this.items', function(){
                    expect(selleckt.items.length).toEqual(3);

                    selleckt.addItems(items);

                    expect(selleckt.items.length).toEqual(6);
                    expect(selleckt.items[3]).toEqual(items[0]);
                    expect(selleckt.items[4]).toEqual(items[1]);
                    expect(selleckt.items[5]).toEqual(items[2]);
                });

                it('appends new options to the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);

                    selleckt.addItems(items);

                    expect($originalSelectEl.children().length).toEqual(6);

                    var newOption1 = $originalSelectEl.find('option').eq(3);
                    expect(newOption1.text()).toEqual('new 1');
                    expect(newOption1.val()).toEqual('new value 1');

                    var newOption2 = $originalSelectEl.find('option').eq(4);
                    expect(newOption2.text()).toEqual('new 2');
                    expect(newOption2.val()).toEqual('new value 2');

                    var newOption3 = $originalSelectEl.find('option').eq(5);
                    expect(newOption3.text()).toEqual('new 3');
                    expect(newOption3.val()).toEqual('new value 3');
                });

                it('appends the new items to the Selleckt element itself', function(done){
                    var $sellecktEl = selleckt.$sellecktEl;
                    var itemClass = '.' + selleckt.itemClass;

                    expect($sellecktEl.find(itemClass).length).toEqual(3);

                    selleckt.addItems(items);

                    //because of the dom event
                    setTimeout(function(){
                        expect($sellecktEl.find(itemClass).length).toEqual(6);
                        done();
                    }, waitTime);
                });

                describe('and a new item has selected:true', function(){
                    var originalSelection;

                    beforeEach(function(){
                        originalSelection = selleckt.$originalSelectEl.find('option:selected');
                        items[0].isSelected = true;
                    });

                    it('selects the new item in the original select', function(done){
                        expect(originalSelection.val()).toEqual('1');

                        selleckt.addItems(items);

                        var newSelection = selleckt.$originalSelectEl.find('option:selected');

                        setTimeout(function(){
                            expect(newSelection.length).toEqual(1);
                            expect(newSelection.val()).toEqual('new value 1');
                            done();
                        }, waitTime);
                    });

                    it('selects the new item in Selleckt', function(done){
                        var $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);

                        expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('foo');

                        selleckt.addItems(items);

                        setTimeout(function(){
                            expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('new 1');
                            done();
                        }, waitTime);
                    });

                    it('hides the new item from the Selleckt list', function(done){
                        expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                        selleckt.addItems(items);

                        setTimeout(function(){
                            expect(selleckt.$items.find('.item[data-value="new value 1"]').css('display')).toEqual('none');
                            done();
                        }, waitTime);
                    });

                    it('adds the previously selected item back to the Selleckt list', function(done){
                        expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                        selleckt.addItems(items);

                        setTimeout(function(){
                            expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('list-item');
                            done();
                        }, waitTime);
                    });

                    it('deselects the previously selected item in the Selleckt', function(done){
                        expect(selleckt.selectedItem.value).toEqual('1');
                        expect(selleckt.selectedItem.label).toEqual('foo');

                        selleckt.addItems(items);

                        setTimeout(function(){
                            expect(selleckt.selectedItem.value).toEqual('new value 1');
                            expect(selleckt.selectedItem.label).toEqual('new 1');
                            done();
                        }, waitTime);
                    });
                });
            });
        });

        describe('Removing items', function(){
            var removeItemValue;
            var waitTime = MutationObserver._period ? MutationObserver._period * 2 : 1;

            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            afterEach(function(){
                selleckt.destroy();
                selleckt = undefined;
            });

            describe('and the removed item is not selected', function(){
                beforeEach(function(){
                    removeItemValue = selleckt.items[2].value;
                });

                it('removes the item from this.items', function(){
                    expect(selleckt.items.length).toEqual(3);
                    expect(selleckt.findItem(removeItemValue)).toBeDefined();

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.items.length).toEqual(2);
                    expect(selleckt.findItem(removeItemValue)).toBeUndefined();
                });

                it('removes the option with the corresponding value from the original select', function(){
                    var $originalSelectEl = selleckt.$originalSelectEl;

                    expect($originalSelectEl.children().length).toEqual(3);
                    expect($originalSelectEl.find('option[value="' + removeItemValue + '"]').length).toEqual(1);

                    selleckt.removeItem(removeItemValue);

                    expect($originalSelectEl.children().length).toEqual(2);
                    expect($originalSelectEl.find('option[value="' + removeItemValue + '"]').length).toEqual(0);
                });

                it('removes the corresponding item from the Selleckt element itself', function(done){
                    var $sellecktEl = selleckt.$sellecktEl;
                    var itemClass = '.' + selleckt.itemClass;

                    expect($sellecktEl.find(itemClass).length).toEqual(3);

                    selleckt.removeItem(removeItemValue);

                    //because of the dom event
                    setTimeout(function(){
                        expect(selleckt.$originalSelectEl.children().length).toEqual(2);
                        expect($sellecktEl.find(itemClass).length).toEqual(2);

                        done();
                    }, waitTime);
                });
            });

            describe('and the removed item is selected', function(){
                beforeEach(function(){
                    removeItemValue = selleckt.selectedItem.value;
                });

                it('removes the corresponding item from the Selleckt element itself', function(done){
                    var $sellecktEl = selleckt.$sellecktEl;
                    var itemClass = '.' + selleckt.itemClass;

                    expect($sellecktEl.find(itemClass).length).toEqual(3);

                    selleckt.removeItem(removeItemValue);

                    //because of the dom event
                    setTimeout(function(){
                        expect(selleckt.$originalSelectEl.children().length).toEqual(2);
                        expect($sellecktEl.find(itemClass).length).toEqual(2);

                        done();
                    }, waitTime);
                });

                it('sets this.selectedItem to undefined if it has the value of the item being removed', function(){
                    expect(selleckt.selectedItem).toBeDefined();

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.selectedItem).toBeUndefined();
                });

                it('sets the placeholder text back', function(){
                    expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(selleckt.selectedItem.label);

                    selleckt.removeItem(removeItemValue);

                    expect(selleckt.$sellecktEl.find('.'+selleckt.selectedTextClass).text()).toEqual(selleckt.placeholderText);
                });
            });

        });

        describe('Events', function(){
            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    $selectEl : $el
                });

                selleckt.render();
            });

            describe('showing the options', function(){
                var $selectedItem;

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                });

                afterEach(function(){
                    $selectedItem = undefined;
                });

                it('shows the options on click on the selected item', function(){
                    var openStub = sinon.stub(selleckt, '_open'),
                        isStub = sinon.stub($.fn, 'is').returns(false);

                    selleckt.$sellecktEl.find('.'+selleckt.selectedClass).trigger('click');

                    expect(openStub.calledOnce).toEqual(true);

                    isStub.restore();
                });
                it('sets absolute positioning on the items container', function(){
                    var setItemsAbsoluteSpy = sinon.spy(selleckt, '_setItemsAbsolute'),
                        setItemsFixedSpy = sinon.spy(selleckt, '_setItemsFixed');

                    selleckt._open();

                    expect(setItemsAbsoluteSpy.calledOnce).toEqual(true);
                    expect(setItemsFixedSpy.called).toEqual(false);
                    expect(selleckt.$sellecktEl.find('.items').css('position')).toEqual('absolute');

                    setItemsFixedSpy.restore();
                    setItemsAbsoluteSpy.restore();
                });
                it('does not call _open when the options are already showing', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        isStub = sinon.stub($.fn, 'is').returns(true);

                    $selectedItem.trigger('click');
                    expect(openSpy.calledOnce).toEqual(false);

                    isStub.restore();
                });
                it('calls "_close" when the body is clicked', function(){
                    var openSpy = sinon.spy(selleckt, '_open'),
                        closeSpy = sinon.spy(selleckt, '_close');

                    selleckt._open();

                    $(document).trigger('click');

                    expect(openSpy.calledOnce).toEqual(true);
                    expect(closeSpy.calledOnce).toEqual(true);
                });
                it('triggers a "close" event when _close is called', function(){
                    var listener = sinon.stub();

                    selleckt.bind('close', listener);
                    selleckt._close();

                    expect(listener.calledOnce).toEqual(true);

                    selleckt.unbind('close', listener);
                });
                it('adds a class of "open" to this.$sellecktEl when the selleckt is opened', function(){
                    selleckt._open();

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);
                });
                it('removes the class of "closed" from this.$sellecktEl when the selleckt is closed', function(){
                    expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);

                    selleckt._open();

                    expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(false);
                });
                it('removes the  "open" class from this.$sellecktEl when the selleckt is closed', function(){
                    selleckt._open();

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                    selleckt._close();

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);
                });
                it('adds a class of "closed" to this.$sellecktEl when the selleckt is closed', function(){
                    selleckt._open();

                    expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(false);

                    selleckt._close();

                    expect(selleckt.$sellecktEl.hasClass('closed')).toEqual(true);
                });

                describe('overflowing options container', function() {
                    var isOverflowingStub;

                    beforeEach(function(){
                        isOverflowingStub = sinon.stub(selleckt, '_isOverflowing', function() {
                            return true;
                        });
                    });
                    afterEach(function(){
                        isOverflowingStub.restore();
                    });

                    it('sets fixed positioning on the items container', function(){
                        var setItemsFixedSpy = sinon.spy(selleckt, '_setItemsFixed'),
                            setItemsAbsoluteSpy = sinon.spy(selleckt, '_setItemsAbsolute');

                        selleckt._open();

                        expect(setItemsFixedSpy.calledOnce).toEqual(true);
                        expect(setItemsAbsoluteSpy.called).toEqual(false);
                        expect(selleckt.$sellecktEl.find('.items').css('position')).toEqual('fixed');

                        setItemsAbsoluteSpy.restore();
                        setItemsFixedSpy.restore();
                    });
                    it('binds to click event on document when options are shown', function(){
                        var eventsData;

                        selleckt._open();

                        eventsData = $._data(document, 'events');

                        expect(eventsData.click).toBeDefined();
                        expect(eventsData.click.length).toEqual(1);
                        expect(eventsData.click[0].namespace).toEqual('selleckt-' + selleckt.id);
                    });
                    it('binds to scroll event on $scrollingParent when options are shown', function(){
                        var eventsData;

                        selleckt._open();

                        eventsData = $._data(selleckt.$scrollingParent[0], 'events');

                        expect(eventsData.scroll).toBeDefined();
                        expect(eventsData.scroll.length).toEqual(1);
                        expect(eventsData.scroll[0].namespace).toEqual('selleckt-' + selleckt.id);
                    });
                    it('calls "_close" when $scrollingParent is scrolled', function(){
                        var openSpy = sinon.spy(selleckt, '_open'),
                            closeSpy = sinon.spy(selleckt, '_close');

                        selleckt._open();

                        $(window).trigger('scroll');

                        expect(openSpy.calledOnce).toEqual(true);
                        expect(closeSpy.calledOnce).toEqual(true);
                    });
                    it('unbinds from scroll event on $scrollingParent when options are hidden', function(){
                        var eventsData;

                        selleckt._open();
                        selleckt._close();

                        eventsData = $._data(selleckt.$scrollingParent[0], 'events');

                        expect(eventsData).toBeUndefined();
                    });
                    it('displays fixed items container below the trigger', function(){
                        // move selleckt to top so there's enough room for the dropdown
                        selleckt.$sellecktEl.css({
                            position:'absolute', top:0
                        });

                        selleckt._open();

                        expect(selleckt.$items.offset().top)
                            .toEqual(selleckt.$sellecktEl.find('.selected').offset().top +
                                selleckt.$sellecktEl.find('.selected').outerHeight());
                        expect(selleckt.$items.hasClass('flipped')).toEqual(false);
                    });
                    it('displays fixed items container on top if there\'s not enough space below the trigger', function(){
                        // create testarea that stretches to the bottom of the screen
                        var $testArea = $('<div class="testarea">').css({
                            position:'fixed', top:0, left:0, width:'100%', height:'100%'
                        }).appendTo('body');

                        // position selleckt in testarea to force the dropdown to go off screen
                        selleckt.$sellecktEl.css({
                            position:'absolute', bottom:0, height: '20px', overflow:'hidden'
                        }).appendTo($testArea);

                        selleckt._open();

                        //IE returns a decimal, so round both up
                        var itemsOffset = Math.ceil(selleckt.$items.offset().top + selleckt.$items.outerHeight());
                        var selectedOffset = Math.ceil(selleckt.$sellecktEl.find('.selected').offset().top);

                        expect(itemsOffset).toEqual(selectedOffset);
                        expect(selleckt.$items.hasClass('flipped')).toEqual(true);

                        // clean up
                        $testArea.remove();
                    });
                    it('removes "flipped" class from this.$items on _close when the dropdown was displayed on top', function(){
                        var flipStub = sinon.stub(selleckt, '_flipIfNeeded', function() {
                            selleckt.$items.addClass('flipped');
                        });

                        selleckt._open();

                        expect(selleckt.$items.hasClass('flipped')).toEqual(true);

                        selleckt._close();

                        expect(selleckt.$items.hasClass('flipped')).toEqual(false);

                        flipStub.restore();
                    });
                });
            });

            describe('item selection', function(){
                var $selectedItem;

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);
                    $selectedItem.trigger('click');
                });

                it('does not allow multiple items to be selected', function(){
                    var item1 = 'foo',
                        item2 = 'bar';

                    selleckt.selectItem(item1);
                    expect(selleckt.getSelection()).toEqual(item1);

                    selleckt.selectItem(item2);
                    expect(selleckt.getSelection()).toEqual(item2);
                });

                it('stores the selected item as this.selectedItem', function(){
                    expect(selleckt.selectedItem).toEqual({
                        value: '1',
                        label: 'foo',
                        data: {}
                    });

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(selleckt.selectedItem).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });
                });
                it('updates the text of the selected item container with the selectedItem\'s label', function(){
                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('foo');

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect($selectedItem.find('.'+selleckt.selectedTextClass).text()).toEqual('bar');
                });
                it('triggers an "itemSelected" event with this.selectedItem', function(){
                    var spy = sinon.spy();
                    selleckt.bind('itemSelected', spy);

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0]).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });
                });
                it('hides the selected item from the list', function(){
                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');
                });
                it('does not trigger an event when the selected item is clicked, were it to be unhidden', function(){
                    var spy = sinon.spy(),
                        $selectedItem = selleckt.$items.find('.item[data-value="1"]');

                    selleckt.bind('itemSelected', spy);

                    $selectedItem.css('display', 'block').trigger('mouseover').trigger('click');

                    expect(spy.called).toEqual(false);
                });
                it('shows the previously-selected item in the list', function(){
                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).toEqual('none');

                    selleckt.$sellecktEl.find('li.item').eq(0).trigger('mouseout');
                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover').trigger('click');

                    expect(selleckt.$items.find('.item[data-value="1"]').css('display')).not.toEqual('none');
                    expect(selleckt.$items.find('.item[data-value="2"]').css('display')).toEqual('none');
                });
                it('highlights the current item and de-highlights all other items on mouseover', function(){
                    var highlightClass = selleckt.highlightClass,
                        liOne = selleckt.$sellecktEl.find('li.item').eq(0), liTwo = selleckt.$sellecktEl.find('li.item').eq(1);

                    expect(liTwo.hasClass(highlightClass)).toEqual(false);

                    liOne.trigger('mouseover');
                    expect(liOne.hasClass(highlightClass)).toEqual(true);

                    liOne.trigger('mouseout');
                    expect(liOne.hasClass(highlightClass)).toEqual(true);

                    liTwo.trigger('mouseover');
                    expect(liOne.hasClass(highlightClass)).toEqual(false);
                    expect(liTwo.hasClass(highlightClass)).toEqual(true);

                    liTwo.children(':first').trigger('mouseover');
                    expect(liTwo.children(':first').hasClass(highlightClass)).toEqual(false);
                    expect(liTwo.hasClass(highlightClass)).toEqual(true);
                });
                it('removes the highlight class from all items when it closes', function(){
                    var highlightClass = selleckt.highlightClass;

                    expect(selleckt.$sellecktEl.find('li.item').eq(1).hasClass(highlightClass)).toEqual(false);

                    selleckt.$sellecktEl.find('li.item').eq(1).trigger('mouseover');

                    expect(selleckt.$sellecktEl.find('li.' + highlightClass).length).toEqual(1);

                    selleckt._close();

                    expect(selleckt.$sellecktEl.find('li.' + highlightClass).length).toEqual(0);
                });
                it('updates the original select element with the new value', function(){
                    selleckt.selectItem(selleckt.items[1]);

                    expect(selleckt.$originalSelectEl.val()).toEqual(selleckt.items[1].value);
                });
                it('updates selleckt when change is triggered on original select', function(){
                    selleckt.$originalSelectEl.val('2').change();

                    expect(selleckt.getSelection().value).toEqual('2');
                });
                it('updates selleckt when change is triggered on original select with no value', function(){
                    selleckt.$originalSelectEl.val('').change();

                    expect(selleckt.getSelection().value).toBeUndefined();
                });
                it('does not update selleckt when change on original select is triggered by selleckt itself', function(){
                    selleckt.$originalSelectEl.val('2').trigger('change', {origin: 'selleckt'});

                    expect(selleckt.getSelection().value).toEqual('1');
                });
                it('fires change() event listeners only once when change event is triggered on original select', function(){
                    var changeStub = sinon.stub();
                    selleckt.$originalSelectEl.on('change', changeStub);
                    selleckt.$originalSelectEl.change();
                    expect(changeStub.callCount).toEqual(1);
                });

                it('triggers a change event on original select when item is selected', function(){
                    var changeHandler = sinon.spy();

                    selleckt.$originalSelectEl.on('change', changeHandler);
                    selleckt.selectItem('foo');

                    expect(changeHandler.calledOnce).toEqual(true);
                    expect(changeHandler.args[0].length).toEqual(2);
                    expect(changeHandler.args[0][1].origin).toEqual('selleckt');

                    selleckt.$originalSelectEl.off('change', changeHandler);
                });

                describe('with an empty option', function(){
                    beforeEach(function(){
                        $el = $(elHtml).append('<option></option>').appendTo('body');
                        selleckt = new SingleSelleckt({
                            $selectEl : $el
                        });

                        selleckt.render();
                    });

                    it('displays the placeholder when the change event is triggered on ' +
                            'the original select and its value is the empty string', function(){
                        selleckt.$originalSelectEl.val('').trigger('change');
                        var emptyOptionDisplayedText = selleckt.$sellecktEl.find('.selectedText').text();
                        expect(emptyOptionDisplayedText).toEqual(selleckt.placeholderText);
                    });
                });

            });

            describe('Keyboard input', function(){
                var $selectedItem,
                    KEY_CODES = {
                        DOWN: 40,
                        UP: 38,
                        ENTER: 13,
                        ESC: 27
                    };

                beforeEach(function(){
                    $selectedItem = selleckt.$sellecktEl.find('.'+selleckt.selectedClass);

                    selleckt.$sellecktEl.focus();
                });

                afterEach(function(){
                    $selectedItem = undefined;
                });

                it('opens the items list when enter is pressed on a closed selleckt', function(){
                    var isStub = sinon.stub($.fn, 'is').returns(false);

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(false);

                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(selleckt.$sellecktEl.hasClass('open')).toEqual(true);

                    expect(isStub.calledOnce).toEqual(true);
                    expect(isStub.calledOn(selleckt.$items)).toEqual(true);
                    expect(isStub.calledWith(':visible')).toEqual(true);

                    isStub.restore();
                });

                it('selects the current item when enter is pressed on an open selleckt', function(){
                    var spy = sinon.spy(),
                        isStub;

                    selleckt.bind('itemSelected', spy);

                    selleckt._open();

                    isStub = sinon.stub($.fn, 'is').returns(true);

                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.DOWN }));
                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(spy.calledOnce).toEqual(true);
                    expect(spy.args[0][0]).toEqual({
                        value: '2',
                        label: 'bar',
                        data: {
                            meh: 'whee',
                            bah: 'oink'
                        }
                    });

                    isStub.restore();
                });

                it('Highlights the next item when DOWN is pressed, the previous when UP is pressed', function(){
                    var liOne = selleckt.$items.find('.item').eq(0),
                        liTwo = selleckt.$items.find('.item').eq(1),
                        liThree = selleckt.$items.find('.item').eq(2);

                    selleckt._open();

                    expect(liOne.is(':visible')).toEqual(false);

                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(false);
                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.DOWN }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(true);

                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.DOWN }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(false);
                    expect(liThree.hasClass(selleckt.highlightClass)).toEqual(true);

                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.UP }));
                    expect(liTwo.hasClass(selleckt.highlightClass)).toEqual(true);
                    expect(liThree.hasClass(selleckt.highlightClass)).toEqual(false);
                });

                it('closes the selleckt when escape is pressed', function(){
                    var closeStub = sinon.stub(selleckt, '_close');

                    selleckt._open();

                    selleckt.$sellecktEl.trigger($.Event('keyup', { keyCode : KEY_CODES.ESC }));

                    expect(closeStub.calledOnce).toEqual(true);
                });

                it('resets focus to selleckt after item is selected', function(){
                    var onFocusStub = sinon.stub();

                    selleckt.$sellecktEl.focus(onFocusStub);
                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.DOWN }));
                    $selectedItem.trigger($.Event('keydown', { which : KEY_CODES.ENTER }));

                    expect(onFocusStub.calledOnce).toEqual(true);
                });
            });
        });

        describe('search', function(){
            var selectHtml = '<select>' +
                    '<option value>Empty</option>' +
                    '<option value="foo">foo</option>' +
                    '<option value="bar">bar</option>' +
                    '<option value="baz">baz</option>' +
                    '<option value="foofoo">foofoo</option>' +
                    '<option value="foobaz">foobaz</option>' +
                    '</select>',
                template =
                '<div class="{{className}}" tabindex=1>' +
                    '<div class="selected">' +
                        '<span class="selectedText">{{selectedItemText}}</span><i class="icon-arrow-down"></i>' +
                    '</div>' +
                    '<ul class="items">' +
                        '{{#showSearch}}' +
                        '<li class="searchContainer">' +
                            '<input class="search"></input>' +
                        '</li>' +
                        '{{/showSearch}}' +
                        '{{#items}}' +
                        '<li class="item" data-text="{{label}}" data-value="{{value}}">' +
                            '<span class="itemText">{{label}}</span>' +
                        '</li>' +
                        '{{/items}}' +
                    '</ul>' +
                '</div>',
                $searchInput;

            describe('initialization', function(){
                it('displays a searchbox if settings.enableSearch is true and ' +
                        'there are more items than options.searchThreshold', function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true,
                        searchThreshold: 0
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(1);
                });
                it('does not display a searchbox if settings.enableSearch is true and ' +
                        'there are fewer items than options.searchThreshold', function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true,
                        searchThreshold: 100
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(0);
                });
                it('does not display a searchbox if settings.enableSearch is false', function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: false
                    });

                    selleckt.render();

                    expect(selleckt.$sellecktEl.find('.searchContainer').length).toEqual(0);
                });

                it('empties the search input when _close() is called', function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true
                    });

                    selleckt.render();

                    var $searchInput = selleckt.$sellecktEl.find('.' + selleckt.searchInputClass);

                    $searchInput.val('foo');

                    selleckt._close();

                    expect($searchInput.val()).toEqual('');
                });

                it('clears search when _open() is called', function(){
                    var filterOptionsStub;

                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true
                    });

                    selleckt.render();

                    filterOptionsStub = sinon.stub(selleckt, 'filterOptions');

                    selleckt._open();

                    expect(filterOptionsStub.calledOnce).toEqual(true);
                    expect(filterOptionsStub.calledWith('')).toEqual(true);
                });

                it('unfilters the selections list when _close() is called', function(){
                    var filterOptionsStub;

                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true
                    });

                    selleckt.render();

                    filterOptionsStub = sinon.stub(selleckt, 'filterOptions');

                    selleckt._close();

                    expect(filterOptionsStub.calledOnce).toEqual(true);
                    expect(filterOptionsStub.calledWith('')).toEqual(true);
                });
            });

            describe('filtering', function(){
                beforeEach(function(){
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml),
                        enableSearch: true
                    });

                    selleckt.render();

                    $searchInput = selleckt.$sellecktEl.find('.search');
                });

                afterEach(function(){
                    $searchInput = undefined;
                });

                it('filters out options with empty values', function(){
                    var output = selleckt._findMatchingOptions(selleckt.items, '');

                    expect(output.length).toEqual(6);
                    expect(output[0]).toEqual({ label: 'Empty', value: '', data:{} });
                });

                it('can annotate the items with matchIndexes', function(){
                    var output = selleckt._findMatchingOptions(selleckt.items, 'ba');

                    expect(output).toEqual([
                        { label: 'Empty', value: '', data:{} },
                        { label: 'foo', value: 'foo', data:{} },
                        { label: 'bar', value: 'bar', data:{}, matchStart: 0, matchEnd: 1 },
                        { label: 'baz', value: 'baz', data:{}, matchStart: 0, matchEnd: 1 },
                        { label: 'foofoo', value: 'foofoo', data:{} },
                        { label: 'foobaz', value: 'foobaz', data:{}, matchStart: 3, matchEnd: 4 }
                    ]);
                });

                it('filters the available options as the user types in the searchbox', function(done){
                    selleckt._open();

                    $searchInput.val('baz').trigger('keyup');

                    setTimeout(function(){
                        expect(selleckt.$items.find('.item').eq(0).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(1).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(2).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(3).css('display')).not.toEqual('none');
                        expect(selleckt.$items.find('.item').eq(4).css('display')).toEqual('none');
                        expect(selleckt.$items.find('.item').eq(5).css('display')).not.toEqual('none');

                        done();
                    }, 1);
                });

                it('wraps matched text in the matching options with a "mark" tag', function(done){
                    selleckt._open();
                    $searchInput.val('baz').trigger('keyup');

                    setTimeout(function(){
                        expect(selleckt.$items.find('.item mark').length).toEqual(2);
                        expect(selleckt.$items.find('.item mark').parent('.itemText').eq(0).text()).toEqual('baz');
                        expect(selleckt.$items.find('.item mark').parent('.itemText').eq(1).text()).toEqual('foobaz');

                        done();
                    }, 1);
                });

                it('escapes the options when filtering and opening', function(){
                    selleckt.destroy();
                    selleckt = new SingleSelleckt({
                        mainTemplate : template,
                        $selectEl : $(selectHtml.replace(/bar/g, '<b>some HTML</b>')),
                        enableSearch: true
                    });

                    selleckt.render();
                    selleckt._open();

                    var $li = selleckt.$sellecktEl.find('li.item:eq(2)');

                    expect($li.children().length).toEqual(1);
                    expect($li.children().eq(0).is('span.itemText')).toEqual(true);

                    expect($li.find('.itemText mark').length).toEqual(1);
                    expect($li.find('.itemText mark').html()).toEqual('');
                    expect($li.find('.itemText').text()).toEqual('some HTML');
                });

                it('triggers an "optionsFiltered" event after filtering, passing the filter term', function(done){
                    var listener = sinon.stub();

                    selleckt._open();

                    selleckt.bind('optionsFiltered', listener);
                    $searchInput.val('aBc').trigger('keyup');


                    setTimeout(function(){
                        expect(listener.calledOnce).toEqual(true);
                        expect(listener.args[0][0]).toEqual('aBc');

                        done();
                    }, 1);
                });
            });
        });

        describe('removal', function(){
            beforeEach(function(){
                selleckt = new SingleSelleckt({
                    mainTemplate : mainTemplate,
                    $selectEl : $el
                });
                selleckt.render();
            });
            afterEach(function(){
                selleckt = undefined;
            });

            it('removes change event from original select element', function(){
                var eventsData = $._data(selleckt.$originalSelectEl[0], 'events');

                expect(eventsData.change).toBeDefined();
                expect(eventsData.change.length).toEqual(1);
                expect(eventsData.change[0].namespace).toEqual('selleckt');

                selleckt.destroy();

                expect(eventsData.change).toEqual(undefined);
            });

            it('removes selleckt data from original select element', function(){
                $el.data('selleckt', selleckt);

                selleckt.destroy();

                expect($el.data('selleckt')).toEqual(undefined);
            });

            it('shows original select element', function(){
                expect($el.css('display')).toEqual('none');

                selleckt.destroy();

                expect($el.css('display')).toEqual('inline-block');
            });

            it('stops observing mutation events', function(){
                var stopObservingMutationsSpy = sinon.spy(selleckt, '_stopObservingMutations');

                selleckt.destroy();

                expect(stopObservingMutationsSpy.calledOnce).toEqual(true);
            });

        });
    });
});
