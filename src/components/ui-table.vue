<template>
  <div class="overflow-auto">
    <table class="ui-table w-full">
      <thead class="">
        <tr>
          <th
            v-for="(column, index) in columns"
            :key="index"
          >
            {{ column.header }}
          </th>

          <th
            v-if="action"
            class="w-10"
          />
        </tr>
      </thead>

      <tbody
        class=""
      >
        <slot
          v-for="(item, rowIndex) in items"
          :key="rowIndex"
          name="row"
          v-bind="{
            item,
            columns,
            rowIndex
          }"
        >
          <tr class="px-4 py-3 border-b border-zinc-700">
            <slot
              v-for="(column, indexColumn) in columns"
              :key="indexColumn"
              :name="`body-cell-${column.name}`"
              v-bind="{
                value: column.field ? item[column.field] : item,
                field: column.field,
                name: column.name,
                column,
                item,
                rowIndex
              }"
            >
              <td class="px-4 py-3 border-b border-zinc-600">
                {{ column.field ? item[column.field] : item }}
              </td>
            </slot>

            <td
              v-if="action"
              class="px-4 py-3 border-b border-zinc-700 w-10"
            >
              <slot
                name="action"
                v-bind="{ item, rowIndex }"
              />
            </td>
          </tr>
        </slot>

        <tr v-if="!items.length">
          <td
            :colspan="columns.length + Number(action)"
            class="px-4 py-3"
          >
            <slot name="empty">
              <div
                class="text-center text-primary"
              >
                <span class="pi pi-info-circle" />
                <span class="ml-2">{{ $t('entries.noItems') }}</span>
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts" generic="ItemData extends Record<string, unknown>">
type Column = {
  name: string,
  field?: string,
  header?: string
}

defineProps<{
  items: ItemData[]
  columns: Column[],
  action?: boolean
}>()
</script>

<style lang="css">
  .ui-table th, td {
    padding-inline: calc(var(--spacing) * 4);
    padding-block: calc(var(--spacing) * 5);
    border-bottom: var(--tw-border-style);
    border-width: 0 0 1px 0;
  }

  .ui-table th {
    text-align: left;
    font-weight: var(--font-weight-medium);
    border-color: var(--color-zinc-600)
  }

  .ui-table td {
    border-color: var(--color-zinc-700)
  }
</style>
