# React Native Tag Input

![alt text](example.png "Example visual")

## Simple Example

```jsx
import TagInput from 'react-native-tag-input';

...

<TagInput
  value={this.state.emails}
  onChange={(emails) => this.setState({ emails })}
  labelExtractor={(email) => email}
  text={this.state.text}
  onChangeText={(text) => this.setState({ text })}
/>
```

## Props
Prop | Description | Type | Default
------ | ------ | ------ | ------
**`value`** | An array of tags, which can be any type, as long as labelExtractor below can extract a string from it | Array | **Required**
**`onChange`** | A handler to be called when array of tags change. The parent should update the value prop when this is called if you want to enable removal of tags | Function | **Required**
**`labelExtractor`** | A function to extract string value for label from item. May also return an element to be shown in place of text, in which case the tagTextColor and tagTextStyle props will be ignored. | Function | **Required**
**`text`** | The text currently being displayed in the TextInput following the list of tags | String | **Required**
**`onChangeText`** | This callback gets called when the user types in the TextInput. The parent should update the text prop when this is called if they want to enable input. This is also where any parsing to detect new tags should occur | Function | **Required**
`editable` | If false, text input is not editable and existing tags cannot be removed | Boolean | `true`
`tagColor` | Background color of tags | String | `'#dddddd'`
`tagTextColor` | Text color of tags | String | `'#777777'`
`tagContainerStyle` | Styling override for container surrounding tag text | Object | `undefined`
`tagTextStyle` | Styling override for tag's text component | Object | `undefined`
`inputDefaultWidth` | Width override for text input's default width when it's empty and showing placeholder | Number | `90`
`inputColor` | Color of text input | String | `'#777777'`
`inputProps` | Any additional [TextInput props](https://facebook.github.io/react-native/docs/textinput) (autoFocus, placeholder, returnKeyType, etc.) | Object | `undefined`
`maxHeight` | Max height of the tag input on screen (will scroll if max height reached) | Number | `75`
`onHeightChange` | Callback that gets passed the new component height when it changes | Function | `undefined`
`scrollViewProps` | Any additional [ScrollView props](https://facebook.github.io/react-native/docs/scrollview) (horizontal, showsHorizontalScrollIndicator, etc.) | Object | `undefined`
