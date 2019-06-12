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
import A from 'algebra.js'
import $ from 'jquery'
import S from 'string'

import { typeset } from '../../modules/mathjax'
import play from './sounds'

var InputChallenge = function($container) {
  var type
  var solution
  var feedback
  var wrongInputs
  var self = this

  self.$form = $container.find('.input-challenge-group')
  self.$input = $container.find('.input-challenge-input')
  self.$button = $container.find('.input-challenge-submit')
  self.$feedback = $container.find('.input-challenge-feedback')

  type = self.$input.data('type')
  solution = self.$input.data('solution')
  feedback = self.$input.data('feedback')
  wrongInputs = self.$input.data('wrong-inputs')

  self.inputs = [
    {
      type: type,
      solution: solution,
      feedback: feedback
    }
  ].concat(wrongInputs)

  $container.click(function() {
    $container.addClass('active')
  })

  $('#content-layout').click(function(e) {
    if (
      $container.hasClass('active') &&
      !$(e.target).closest($container).length &&
      !$(e.target).is($container)
    ) {
      $container.removeClass('active')
      $('.active', $container).removeClass('active')
    }
  })

  self.init()
}

InputChallenge.prototype.init = function() {
  var self = this

  self.$feedback.collapse({
    toggle: false
  })

  self.$form.submit(function(e) {
    var index, input, isCorrect, feedback

    e.preventDefault()

    index = self.inputs.findIndex(self.matchesInput.bind(self))
    input = self.inputs[index] || {}

    isCorrect = index === 0

    feedback = input.feedback || (isCorrect ? 'Right!' : 'Wrong.')

    self.$feedback.fadeOut(500, function() {
      self.$feedback.html(feedback).fadeIn(500)
      typeset(self.$feedback.get(0))
      if (isCorrect) {
        self.$feedback.addClass('positive')
        changeClass(self.$button, 'btn-primary', 'btn-success')
        play('correct')
      } else {
        self.$feedback.removeClass('positive')
        self.$button.removeClass('btn-success')
        changeClass(self.$button, 'btn-primary', 'btn-warning', 2000)
        play('wrong')
      }
    })

    self.$feedback.collapse('show')
    return false
  })
}

InputChallenge.prototype.matchesInput = function(input) {
  try {
    var solution = this.normalize(input, input.solution)
    var submission = this.normalize(input, this.$input.val())

    switch (input.type) {
      case 'input-expression-equal-match-challenge':
        return solution.subtract(submission).toString() === '0'
      default:
        return solution === submission
    }
  } catch (err) {
    // e.g. if user input could not be parsed
    return false
  }
}

InputChallenge.prototype.normalize = function(input, string) {
  var normalizeNumber = function(string) {
    return S(string).replaceAll(',', '.').s
  }
  var temp = S(string).collapseWhitespace()

  switch (input.type) {
    case 'input-number-exact-match-challenge':
      return S(normalizeNumber(temp))
        .replaceAll(' /', '/')
        .replaceAll('/ ', '/').s
    case 'input-expression-equal-match-challenge':
      return A.parse(normalizeNumber(temp))
    default:
      return temp.s.toUpperCase()
  }
}

function changeClass($element, oldClasses, newClasses, time) {
  $element.removeClass(oldClasses).addClass(newClasses)
  if (time) {
    setTimeout(function() {
      $element.removeClass(newClasses).addClass(oldClasses)
    }, time)
  }
}

$.fn.InputChallenge = function() {
  return $(this).each(function() {
    // eslint-disable-next-line no-new
    new InputChallenge($(this))
  })
}
