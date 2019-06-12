/**
 * This file is part of Athene2 Assets.
 *
 * Copyright (c) 2017-2019 Serlo Education e.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @copyright Copyright (c) 2013-2019 Serlo Education e.V.
 * @license   http://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://github.com/serlo-org/athene2-assets for the canonical source repository
 */
import $ from 'jquery'

import { reprocess, typeset, queue } from '../../modules/mathjax'
import play from './sounds'

var MultipleChoice

MultipleChoice = function() {
  function checkDimensions($self) {
    var totalWidth = 0
    var changed = false

    $('.multiple-choice-answer-content', $self).each(function() {
      totalWidth += $(this).width()
      if (totalWidth > $self.width() || $(this).height() > 35) {
        changed = true
        $self.addClass('extended')
        return false
      }
    })

    return changed
  }

  function handleResize($self) {
    if (!$self.hasClass('extended')) {
      typeset($self.get(0))
      queue(function() {
        if (checkDimensions($self)) {
          reprocess($self.get(0))
        }
      })
    }
  }

  return $(this).each(function() {
    var $self = $(this)
    var $group = $('.multiple-choice-group', $self)

    handleResize($self)
    $(window).bind('change-width', function() {
      handleResize($self)
    })

    $(
      '.multiple-choice-answer-feedback, .multiple-choice-group-failure, .multiple-choice-group-success',
      $group
    ).collapse({
      toggle: false
    })

    $self.click(function() {
      $self.addClass('active')
    })

    $('.multiple-choice-answer-content', $self).click(function(e) {
      e.preventDefault()
      $(this).toggleClass('active')
    })

    $('#content-layout').click(function(event) {
      if (
        $self.hasClass('active') &&
        !$(event.target).closest($self).length &&
        !$(event.target).is($self)
      ) {
        $self.removeClass('active')
        $('.active', $self).removeClass('active')
        $('.multiple-choice-answer-feedback', $self)
          .not('.positive')
          .collapse('hide')
      }
    })

    $group.submit(function(e) {
      e.preventDefault()
      var mistakes = 0
      var missingSolutions = 0
      var solutions = []
      var $submit = $('.multiple-choice-submit', $group)
      var $feedbackFailure = $(
        '.multiple-choice-answer-feedback.negative',
        $group
      )
      var $feedbackSuccess = $(
        '.multiple-choice-answer-feedback.positive',
        $group
      )
      var $feedbackMissingSolutions = $(
        '.multiple-choice-answer-feedback.missing-solutions',
        $group
      )

      $('.multiple-choice-answer-content', this).each(function(k, v) {
        var $option = $(v)
        var answer =
          Boolean($option.hasClass('active')) ||
          Boolean($option.hasClass('btn-success'))
        var correct = Boolean($option.data().correct)

        if (correct && answer) {
          changeClass($option, 'button-default', 'btn-success')
          solutions.push($option)
        } else if (correct && !answer) {
          // correct solution not marked as correct
          missingSolutions++
          mistakes++
        } else if (!correct && answer) {
          // wrong solution marked wrongfully
          changeClass($option, 'button-default', 'btn-warning', 2000)
          $option.siblings('.multiple-choice-answer-feedback').collapse('show')
          mistakes++
        } else {
          $option.siblings('.multiple-choice-answer-feedback').collapse('hide')
        }
      })

      if (mistakes === 0) {
        // no mistakes
        $feedbackFailure.collapse('hide')
        $feedbackSuccess.collapse('show')
        $feedbackMissingSolutions.collapse('hide')
        changeClass($submit, 'btn-primary', 'btn-success')
        play('correct')
      } else if (mistakes === missingSolutions) {
        // all mistakes are missing solutions
        $('.multiple-choice-answer-content.active', $self).removeClass('active')
        changeClass($submit, 'btn-primary', 'btn-warning', 2000)
        $feedbackFailure.collapse('hide')
        $feedbackSuccess.collapse('hide')
        $feedbackMissingSolutions.collapse('show')
        play('wrong')
      } else {
        // wrong answer selected

        $('.multiple-choice-answer-content.active', $self).removeClass('active')
        changeClass($submit, 'btn-primary', 'btn-warning', 2000)
        $feedbackFailure.collapse('show')
        $feedbackSuccess.collapse('hide')
        $feedbackMissingSolutions.collapse('hide')
        play('wrong')
      }
      return false
    })
  })

  function changeClass($element, oldClasses, newClasses, time) {
    $element.removeClass(oldClasses).addClass(newClasses)
    if (time) {
      setTimeout(function() {
        $element.removeClass(newClasses).addClass(oldClasses)
      }, time)
    }
  }
}

$.fn.MultipleChoice = MultipleChoice
