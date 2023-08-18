declare module 'react-native-tag-input' {
  import React, {PureComponent} from 'react'
  import {TextInputProps, ScrollView} from 'react-native'

  type StyleObj = Record<string, any>

  type KeyboardShouldPersistTapsProps =
    | 'always'
    | 'never'
    | 'handled'
    | false
    | true

  type RequiredProps<T> = {
    /**
     * An array of tags, which can be any type, as long as labelExtractor below
     * can extract a string from it
     */
    value: ReadonlyArray<T>
    /**
     * A handler to be called when array of tags change. The parent should update
     * the value prop when this is called if they want to enable removal of tags
     */
    onChange: (items: ReadonlyArray<T>) => void
    /**
     * Function to extract string value for label from item
     */
    labelExtractor: (tagData: T) => string | React.ReactNode
    /**
     * The text currently being displayed in the TextInput following the list of
     * tags
     */
    text: string
    /**
     * This callback gets called when the user types in the TextInput. The parent
     * should update the text prop when this is called if they want to enable
     * input. This is also where any parsing to detect new tags should occur
     */
    onChangeText: (text: string) => void
  }

  type OptionalProps = {
    /**
     * If false, text input is not editable and existing tags cannot be removed.
     */
    editable: boolean
    /**
     * Background color of tags
     */
    tagColor: string
    /**
     * Text color of tags
     */
    tagTextColor: string
    /**
     * Styling override for container surrounding tag text
     */
    tagContainerStyle?: StyleObj
    /**
     * Styling override for tag's text component
     */
    tagTextStyle?: StyleObj
    /**
     * Width override for text input's default width when it's empty and showing placeholder
     */
    inputDefaultWidth: number
    /**
     * Color of text input
     */
    inputColor: string
    /**
     * Any misc. TextInput props (autoFocus, placeholder, returnKeyType, etc.)
     */
    inputProps?: TextInputProps
    /**
     * Max height of the tag input on screen (will scroll if max height reached)
     */
    maxHeight: number
    /**
     * Callback that gets passed the new component height when it changes
     */
    onHeightChange?: (height: number) => void
    /**
     * Any ScrollView props (horizontal, showsHorizontalScrollIndicator, etc.)
     */
    scrollViewProps?: ScrollView['props']
  }

  type Props<T> = RequiredProps<T> & Partial<OptionalProps>

  class TagInput<T> extends PureComponent<Props<T>> {}
  export default TagInput
}
