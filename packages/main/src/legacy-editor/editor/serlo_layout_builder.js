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
import _ from 'underscore'

import eventScope from '../../libs/eventscope'
import Modal from '../../modules/modals'
import t from '../../modules/translator'
import LayoutAdd from './serlo_layout_add'
import Row from './serlo_layout_row'

var LayoutBuilder

LayoutBuilder = function(configuration) {
  if (configuration === undefined) {
    throw new Error('No LayoutBuilderConfiguration set for LayoutBuilder')
  }

  var that = this
  var layoutAdd

  eventScope(this)

  that.layouts = configuration.layouts
  that.rows = []

  layoutAdd = new LayoutAdd(that.layouts)

  layoutAdd.addEventListener('add-layout', function(layout) {
    that.addRow(layout)
  })

  that.$el = layoutAdd.$el
}

LayoutBuilder.prototype.addRow = function(
  requestedLayout,
  data,
  atIndex,
  doNotTriggerSelect
) {
  var newRow
  var before
  var that = this

  newRow = new Row(requestedLayout, that.rows.length, data, that.layouts)

  newRow.addEventListener('remove', function(row) {
    Modal.show(
      {
        type: 'danger',
        title: t('Remove row'),
        content: t('Are you sure you want to delete this row?'),
        cancel: true,
        okayLabel: 'Yes'
      },
      'delete-row',
      function() {
        that.removeRow(row)
      }
    )
  })

  newRow.addEventListener('add-layout', function(layout) {
    that.addRow(layout, null, newRow.index)
  })

  newRow.addEventListener('move-up', function() {
    that.reOrderRows(newRow, -1)
  })

  newRow.addEventListener('move-down', function() {
    that.reOrderRows(newRow, +1)
  })

  newRow.index = atIndex === undefined ? that.rows.length : atIndex

  // insert newRow in that.rows
  // at given index
  before = that.rows.splice(0, newRow.index)
  before.push(newRow)
  that.rows = before.concat(that.rows)

  that.updateRowIndexes()

  that.trigger('add', newRow)

  if (!doNotTriggerSelect) {
    newRow.trigger('select', newRow.columns[0])
  }

  return newRow
}

LayoutBuilder.prototype.removeRow = function(row) {
  row.$el.remove()

  this.rows.splice(row.index, 1)
  this.updateRowIndexes()

  row.trigger('update')
  row = null
}

LayoutBuilder.prototype.reOrderRows = function(rowToUpdate, upOrDown) {
  var that = this
  var before

  that.rows.splice(rowToUpdate.index, 1)

  before = that.rows.splice(0, rowToUpdate.index + upOrDown)

  before.push(rowToUpdate)
  that.rows = before.concat(that.rows)

  that.updateRowIndexes()

  rowToUpdate.trigger('reorder')
}

LayoutBuilder.prototype.updateRowIndexes = function() {
  _.each(this.rows, function(row, i) {
    row.index = i
  })
}

export default LayoutBuilder
