<template>
  <pr-card>
    <template #title>
      <div class="flex justify-between items-center">
        {{ $t("entries.title") }}

        <pr-button
          class="ml-2"
          icon="pi pi-plus"
          variant="outlined"
          aria-label="Plus"
          @click="addItem"
        />
      </div>
    </template>

    <template #content>
      <pr-message
        class="my-4"
        severity="info"
        icon="pi pi-info-circle"
      >
        {{ $t('entries.prompt') }}
      </pr-message>

      <!-- это для того что бы убрать предупреждение от Google c полями password без Form -->
      <form
        id="form"
        method="GET"
      />

      <ui-table
        :columns="columns"
        :items="entriesStore.entries"
        action
      >
        <template #body-cell-tags="{ item, rowIndex, field, }">
          <td class="min-w-[150px] md:w-1/4">
            <pr-textarea
              :model-value="parserTags(item.tags)"
              :style="{ minHeight: '42px', display: 'block' }"
              :data-field="field"
              :invalid="!!errorRows.get(item.id)?.tags"
              rows="1"
              fluid
              auto-resize
              @blur="resolver($event, rowIndex)"
            />

            <pr-message
              v-show="!!errorRows.get(item.id)?.tags"
              class="absolute"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errorRows.get(item.id)?.tags?.errorMessage }}
            </pr-message>
          </td>
        </template>

        <template #body-cell-recordType="{ value, field, rowIndex }">
          <td class="md:w-1/4">
            <pr-select
              :model-value="value"
              :options="types"
              :data-field="field"
              fluid
              @value-change="updateData($event, 'recordType', rowIndex)"
            />
          </td>
        </template>

        <template #body-cell-login="{ item, value, rowIndex, field }">
          <td
            :colspan="item.recordType === 'LDAP' ? 2 : 1"
            class="min-w-[150px]"
          >
            <pr-input-text
              :model-value="value"
              :data-field="field"
              :invalid="!!errorRows.get(item.id)?.login"
              fluid
              @blur="resolver($event, rowIndex)"
            />

            <pr-message
              v-show="!!errorRows.get(item.id)?.login"
              class="absolute"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errorRows.get(item.id)?.login?.errorMessage }}
            </pr-message>
          </td>
        </template>

        <template #body-cell-password="{ value, item, rowIndex, field }">
          <td
            v-show="item.recordType === 'Локальная'"
            class="min-w-[150px]"
          >
            <pr-password
              :model-value="value"
              :feedback="false"
              :invalid="!!errorRows.get(item.id)?.password"
              :input-props="{
                'data-field': field,
                autocomplete: 'on',
                form: 'form'
              }"
              fluid
              toggle-mask
              @blur="resolver($event, rowIndex)"
            />

            <pr-message
              v-show="!!errorRows.get(item.id)?.password"
              class="absolute"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errorRows.get(item.id)?.password?.errorMessage }}
            </pr-message>
          </td>
        </template>

        <template #action="{ rowIndex }">
          <pr-button
            icon="pi pi-trash"
            variant="outlined"
            aria-label="Trash"
            @click="removeItem(rowIndex)"
          />
        </template>
      </ui-table>
    </template>
  </pr-card>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import { useEntriesStore } from "@/stores/entries"
import UiTable from "./ui-table.vue"
import { useI18n } from "vue-i18n"

import type { Entry } from "@/stores/types"

type Fields = keyof Entry
type CheckScheme = {
  [key in Fields]?: Record<string, {
    max?: number,
    min?: number
    required?: boolean
    errorMessage?: string
  }>
}
type ErrorData = {
  [key in Fields]?: { errorMessage?: string }
}

const { t } = useI18n()
const entriesStore = useEntriesStore()

const types = [
  "Локальная",
  "LDAP",
]
const columns = [
  { name: "tags", field: "tags", header: t("entries.tags") },
  { name: "recordType", field: "recordType", header: t("entries.type") },
  { name: "login", field: "login", header: t("entries.login") },
  { name: "password", field: "password", header: t("entries.password") },
]
const errorRows = reactive(new Map<string | number, ErrorData>())
const separator = ";"
const regex = new RegExp(separator, "g")

const checkScheme: CheckScheme = {
  tags: {
    maxLength: {
      max: 50,
      errorMessage: t('errorMessage.maxLength', { length: 50 })
    }
  },
  login: {
    required: {
      required: true,
      errorMessage: t('errorMessage.required')
    },
    maxLength: {
      max: 100,
      errorMessage: t('errorMessage.maxLength', { length: 100 })
    }
  },
  password: {
    required: {
      required: true,
      errorMessage: t('errorMessage.required')
    },
    maxLength: {
      max: 100,
      errorMessage: t('errorMessage.maxLength', { length: 100 })
    }
  }
}

const getNativeString = (str: string, regex?: RegExp) => {
  str = str.trim()

  if (regex) {
    str = str.replace(regex, '')
  }

  return str
}

function parserTags (value: string): Entry['tags']
function parserTags (value: Entry['tags']): string
function parserTags (value: string | Entry['tags']): Entry['tags'] | string {
  if (typeof value === 'string') {
    return getNativeString(value, regex).length
      ? value.split(separator).filter(text => !!text).map(text => ({ text }))
      : []
  } else {
    return value.reduce((str, item, index) => {
      return str += value.length === index + 1
        ? item.text
        : `${item.text}${separator}`
    }, '')
  }
}

const addItem = () => {
  const item:Entry = {
    id: Date.now(),
    tags: [],
    recordType: types[0],
    login: "",
    password: null
  }

  entriesStore.$patch((state) => {
    state.entries.push(item)
  })
}

const removeItem = (index: number) => {
  entriesStore.$patch((state) => {
    state.entries.splice(index, 1)
  })
}

const updateData = (value: string, key: Fields, index: number) => {
  let item = entriesStore.entries[index]

  if (!item?.hasOwnProperty(key)) return

  item = { ...item }

  if (key === "tags") {
    item.tags = parserTags(value)
  } else if (key === "recordType") {
    item.recordType = value
    item.password = null
  } else {
    item[key] = value
  }

  entriesStore.$patch((state) => {
    state.entries[index] = item
  })
}

const resolver = (event: Event, index: number) => {
  const {
    value,
    dataset
  } = (<HTMLTextAreaElement | HTMLInputElement>event.target)
  const field = dataset.field as Fields
  const item = entriesStore.entries[index]

  let isValid = true
  let errorData: ErrorData = {}

  if (errorRows.has(item.id)) {
    const currentErrorData = errorRows.get(item.id)

    if (currentErrorData?.hasOwnProperty(field)) {
      delete currentErrorData[field]
    }

    errorData = currentErrorData as ErrorData
  }

  if (field && checkScheme.hasOwnProperty(field)) {
    const checkList = checkScheme[field]

    for (const key in checkList) {
      if (!isValid) break

      if (checkList[key].max) {
        isValid = isValid && value.length <= checkList[key].max
      } else if (checkList[key].min) {
        isValid = isValid && value.length >= checkList[key].min
      } else if (checkList[key].required) {
        isValid = isValid && !!value
      }

      if (!isValid && checkList[key].errorMessage) {

        errorData[field] = {
          errorMessage: checkList[key].errorMessage
        }
      }
    }
  }

  if (isValid) {
    updateData(value, field, index)
  } else {
    errorRows.set(item.id, errorData)
  }
}

</script>

<style scoped></style>
