/**
 * Original code is from : https://www.tailwindreact.com/application-ui/forms/date-pickers
 * Modified by : klokt.valg@gmail.com
 */
import 'react-datepicker/dist/react-datepicker.css'

import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { BiCalendar, BiTime } from 'react-icons/bi'

function DatePicker1(props) {
  /** @preserve
   *
   *  Please Note:
   *  ------------
   *  We are using styled-jsx here to assign tailwind classes to elements that are not exposed
   *  for styling by the underlying react-datepicker library. You can use the same approach or
   *  any other tool of you choice to achieve this. Example could be a combination of
   *  styled-components with twin.macro or even a custom scss stylesheet.
   */
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    <div>
      <style jsx global>{`
        /* Creating some classes and mixins to reuse */

        .primary-background-color {
          @apply bg-white;
        }
        .active-bg-color {
          @apply !bg-yellow-200;
        }
        .close-bg-color {
          @apply bg-gray-400;
        }
        .active-text-color {
          @apply !text-gray-400;
        }
        .primary-border-color {
          @apply border-gray-400;
        }
        .primary-border-top-color {
          @apply !border-t-gray-400;
        }
        .primary-border-bottom-color {
          @apply !border-b-gray-400;
        }
        .border-based-arrow-color {
          @apply border-gray-700;
        }
        .item-hover-color {
          @apply !bg-gray-100;
        }
        .text-primary {
          @apply text-gray-700;
        }
        .text-light {
          @apply !text-gray-500;
        }
        .text-disabled {
          @apply !text-gray-300;
        }
        .scrollbar-base-color {
          @apply bg-yellow-100;
        }
        .scrollbar-thumb-color {
          @apply bg-yellow-300;
        }

        @mixin highlighted-item {
          & {
            @apply active-bg-color active-text-color;
            &:hover {
              @apply active-bg-color;
            }
          }
        }

        @mixin styled-scrollbar {
          &::-webkit-scrollbar-track {
            @apply scrollbar-base-color;
          }

          &::-webkit-scrollbar {
            @apply w-1 h-1 scrollbar-base-color;
          }

          &::-webkit-scrollbar-thumb {
            @apply scrollbar-thumb-color;
          }
        }

        @mixin option-arrow-base {
          & {
            content: '';
            @apply absolute block border-t border-r border-based-arrow-color h-2 w-2 left-1/2 -translate-x-1/2;
          }
        }

        .react-datepicker {
          @apply border primary-border-color rounded-md !p-2;
          &__navigation {
            *::before {
              @apply !border-t !border-r border-based-arrow-color;
            }
            &:hover *::before {
              @apply primary-border-color;
            }

            &--previous {
              @apply left-[0.625rem];
            }
            &--next {
              @apply right-[0.625rem];
            }
            &--next--with-time:not(&--next--with-today-button) {
              @apply left-[13.5rem];
            }
          }

          &__triangle::before {
            @apply h-[3px] border-[5px] !important;
          }

          &__triangle::after {
            @apply border-b-white h-[3px] border-[5px] !important;
          }

          &-popper[data-placement^='top'] {
            .react-datepicker__triangle::before {
              @apply primary-border-top-color primary-background-color !important;
            }
          }

          &-popper[data-placement^='bottom'] {
            .react-datepicker__triangle::before {
              @apply primary-border-bottom-color primary-background-color !important;
            }
          }

          &__header {
            @apply primary-background-color border-b-0;
          }

          &__current-month,
          &-year-header,
          &-time__header {
            @apply !text-xs !font-extralight text-light -mt-1 pb-1;
          }

          &__day {
            &-name {
              @apply text-light;
            }

            &:hover {
              @apply item-hover-color;
            }
          }

          &__year,
          &__quarter,
          &__month,
          &__day {
            @apply text-primary rounded-md;

            &--selected,
            &--keyboard-selected,
            &-text--selected,
            &-text--keyboard-selected,
            &--in-range,
            &--in-selecting-range {
              @include highlighted-item;
            }

            &--disabled,
            &--excluded {
              @apply text-disabled cursor-not-allowed;
            }
          }

          &__year,
          &__quarter,
          &__month {
            @apply py-[0.1rem];
            &-text {
              @apply py-[0.1rem] px-[0.1rem] !w-[4.5rem];
            }
          }

          &__time {
            &-container {
              @apply border-l-0 w-24;
            }

            &-list {
              @apply space-y-1;
              &-item {
                @apply flex rounded-md justify-center items-center text-xs mx-1;

                &:hover {
                  @apply item-hover-color;
                }

                &--selected {
                  @include highlighted-item;
                }

                &--disabled,
                &--excluded {
                  @apply text-disabled cursor-not-allowed !important;
                }
              }

              @include styled-scrollbar;
            }
          }

          &__close-icon {
            @apply pr-9;
            &::after {
              @apply close-bg-color font-extrabold;
            }
          }

          &__year,
          &__month,
          &__month-year {
            &-dropdown {
              @apply primary-background-color primary-border-color w-2/3 py-2;
              @include styled-scrollbar;

              &-container {
                @apply text-xs font-extralight text-light;
              }

              .react-datepicker__year-option {
                &:first-child {
                  a {
                    @apply h-4;
                    &::before {
                      @include option-arrow-base;
                      @apply top-1/2 translate-y-1/2 -rotate-45;
                    }
                  }
                }
                &:last-child {
                  a {
                    @apply h-4;
                    &::after {
                      @include option-arrow-base;
                      @apply -translate-y-1/2 rotate-[135deg];
                    }
                  }
                }
              }
            }

            &-read-view {
              &--down-arrow {
                @apply !border-t !border-r border-based-arrow-color h-[0.375rem] w-[0.375rem] mt-[0.188rem];
              }
              &:hover &--down-arrow {
                @apply primary-border-color;
              }
            }

            &-option,
            &-option--selected_month-year {
              @apply py-1;
            }
            &-option {
              &--selected {
                @apply active-text-color;
              }

              &:hover {
                @apply item-hover-color;
              }
            }
          }

          &__input-time-container {
            @apply flex items-center justify-between pr-6 text-primary;
            input {
              @apply outline-none;
            }
          }
        }
      `}</style>
      <DatePicker
        {...props}
        popperModifiers={[
          {
            name: 'arrow',
            options: {
              padding: {
                left: 24,
                right: 24,
              },
            },
          },
          ...(props.popperModifiers ?? []),
        ]}
      />
    </div>
  )
}

function InputGroup6({
  label,
  name,
  value,
  onChange,
  type = 'text',
  decoration,
  inputClassName = '',
  decorationClassName = '',
  disabled,
}) {
  return (
    <div className="flex flex-row items-stretch w-full">
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        title={label}
        placeholder={label}
        aria-label={label}
        className={`peer block w-full px-2 py-1 text-primary text-sm font-medium bg-gray-100 border border-r-0 focus:border-gray-400 dark:bg-white dark:bg-opacity-10 focus:outline-none focus:ring-0 appearance-none rounded-tr-none rounded-br-none rounded transition-colors duration-300 ${
          disabled ? 'bg-gray-200' : ''
        } ${inputClassName}`}
        disabled={disabled}
      />
      <div
        className={`flex items-center rounded-tl-none rounded-bl-none rounded px-1 py-1 text-primary bg-gray-100 dark:bg-white dark:bg-opacity-10 border border-l-0 border-gray-600 peer-focus:border-gray-400 peer-focus:bg-white peer-focus:text-secondary transition-colors duration-300 ${
          disabled ? 'bg-gray-200' : ''
        } ${decorationClassName}`}
      >
        {decoration}
      </div>
    </div>
  )
}

const CustomInputField = forwardRef(
  (
    {
      name,
      value,
      label,
      onClick,
      disabled,
      inputClassName,
      icon = <BiCalendar size="1rem" />,
    },
    ref
  ) => (
    <button className="w-full " onClick={onClick} ref={ref} disabled={disabled}>
      <InputGroup6
        name={name}
        value={value}
        onChange={() => null}
        label={label}
        decoration={icon}
        disabled={disabled}
        inputClassName={inputClassName}
      />
    </button>
  )
)

const TimeInputSelect = ({ date, onChange }) => (
  <DatePicker1
    selected={date}
    onChange={(d) => onChange(d.toTimeString())}
    customInput={
      <CustomInputField
        name="name"
        label="Select time"
        inputClassName="!w-32"
        icon={<BiTime size="1rem" />}
      />
    }
    startDate={date}
    popperPlacement="top"
    popperClassName="-mb-2"
    showTimeSelect
    showTimeSelectOnly
    dateFormat="h:mm aa"
    showPopperArrow={false}
  />
)

function TextWithDatePicker({
  label = '',
  value = new Date(),
  onChange,
  dateFormat = 'MMMM d, yyyy',
}) {
  return (
    <DatePicker1
      selected={value}
      onChange={onChange}
      customInput={<CustomInputField label={label} />}
      startDate={value}
      popperPlacement="bottom"
      dateFormat={dateFormat}
    />
  )
}

function TextWithDateTimePicker({
  label = '',
  value = new Date(),
  onChange,
  dateFormat = 'MMMM d, yyyy h:mm aa',
}) {
  return (
    <DatePicker1
      selected={value}
      onChange={onChange}
      customInput={<CustomInputField label={label} />}
      startDate={value}
      popperPlacement="bottom"
      showTimeInput
      customTimeInput={<TimeInputSelect date={value} onChange={onChange} />}
      dateFormat="MMMM d, yyyy h:mm aa"
    />
  )
}

export { DatePicker1 as DatePicker, TextWithDatePicker, TextWithDateTimePicker }
