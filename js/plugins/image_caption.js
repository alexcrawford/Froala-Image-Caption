(function ($) {
  $.Editable.DEFAULTS = $.extend($.Editable.DEFAULTS, {
    imageCaption: true
  });

  $.Editable.prototype.initImageCaptionEvents = function() {
    var that = this;
    this.$element.on('click touchend', 'img:not([contenteditable="false"])', function(e) {
      if ($(this).closest('.thumbnail').length > 0)
        var caption = $(this).closest('.thumbnail').find('.caption').html();
      else
        var caption = '';
      that.$image_editor.find('.f-image-caption textarea').val(caption);
    });
  };

  var originalAddImageClass = $.Editable.prototype.addImageClass;
  $.Editable.prototype.addImageClass = function($obj, cls) {
    originalAddImageClass($obj, cls);
    if (!this.options.imageCaption)
      return;
    if ($obj.closest('.thumbnail').length > 0) {
      originalAddImageClass($obj.closest('.thumbnail'), cls);
      if (cls == 'fr-fin')
        $obj.closest('.thumbnail').find('.caption').css('width', 'auto');
      else
        $obj.closest('.thumbnail').find('.caption').css('width', ($obj.attr('width')-18)+'px')
    }
  };

  $.Editable.prototype.addCaptionField = function() {
    $('<div class="f-popup-line f-image-caption">')
        .append('<label><span data-text="true">Caption</span>: </label>')
        .append($('<textarea class="caption-input"></textarea>').on('mouseup keydown', function(e) {
          var keyCode = e.which;
          if (!keyCode || keyCode !== 27)
            e.stopPropagation();
        }))
        .append('<button class="f-ok" style="float:right!important;" data-text="true" data-callback="setImageCaption" data-cmd="setImageCaption title="OK">OK</button>')
        .appendTo(this.$image_editor);
  };

  $.Editable.prototype.bindKeyboardCaptionDeletionHandler = function() {
    $('.froala-element').on('keydown', function(e) {
      if (e.keyCode == 8 || e.keyCode == 46) {
        $(this).find('.thumbnail .caption').each(function(i, caption) {
          if ($.trim($(caption).text()) === '') {
            var $img = $(caption).closest('.thumbnail').find('img');
            $(caption).closest('.thumbnail').replaceWith('<p>'+$img.get(0).outerHTML+'</p>');
          }
        });
      }
    });
  };

  var originalRemoveImage = $.Editable.prototype.removeImage;
  $.Editable.prototype.removeImage = function() {
    if (!this.options.imageCaption)
      return originalRemoveImage.call(this);
    var $image_editor = this.$element.find('span.f-img-editor');
    if ($image_editor.length === 0) return false;
    var $img_parent = $image_editor.parents('.thumbnail');
    originalRemoveImage.call(this);
    if ($img_parent.length > 0)
      $img_parent.eq(0).remove();
  };

  $.Editable.prototype.setImageCaption = function() {
    var $image = this.$element.find('span.f-img-editor img'),
      captionText = this.$image_editor.find('.f-image-caption textarea').val();
    this.hide();
    this.closeImageMode();
    if ($.trim(captionText) === '') {
      if ($image.closest('.thumbnail').length > 0)
        $image.closest('.thumbnail').replaceWith('<p>'+$image.get(0).outerHTML+'</p>');
    } else {
      if ($image.closest('.thumbnail').length > 0)
        $image.closest('.thumbnail').find('.caption').text(captionText);
      else {
        var classes = 'thumbnail clearfix '+this.getImageClass($image.attr('class'));
        var captionHtml = '<div class="post-caption-container"><figure class="'+classes+'">'+$image.get(0).outerHTML
          +'<figcaption class="caption pull-center" style="width:'+($image.attr('width')-18)+'px">'+captionText+'</figcaption></figure></div>';
        if ($image.parent().children().length > 1)
          $image.replaceWith(captionHtml);
        else
          $image.parent().replaceWith(captionHtml);
      }
    }
  };

  $.Editable.prototype.initCaptions = function() {
    if (!this.options.imageCaption)
      return;
    this.initImageCaptionEvents();
    this.addCaptionField();
    this.bindKeyboardCaptionDeletionHandler();
    this.$original_element.on('editable.imageResize', function(e) {
      var $imgEditor = $('.f-img-editor');
      if ($imgEditor.closest('.thumbnail').length == 0 || $imgEditor.find('img').hasClass('fr-fin'))
        return;
      $imgEditor.closest('.thumbnail').find('.caption').css('width', ($imgEditor.find('img').attr('width')-18)+'px');
    });
  };

  $.Editable.initializers.push($.Editable.prototype.initCaptions);
})(jQuery);
