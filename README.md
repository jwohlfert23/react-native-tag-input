# React Native Tag Input

![alt text](example.png "Example visual")

Simple Example

```
import TagInput from 'react-native-tag-input';

...

<TagInput
  value={this.state.emails}
  onChange={(emails) => this.onEmailChange(emails)}
  labelExtractor={(email) => email}
/>
```


| Available Properties | Description |
-----------------------|-----------------
| onChange | (Required) A handler to be called when array of tags change. When new tags are added, they are appended as strings. If you use a non-string item type, make sure to either translate the strings to your item type before passing this value on to the "value" prop, or otherwise make sure your labelExtractor can handle both your item type and strings. |
| value | (Required) An array of tags, which can be any type, as long as labelExtractor below can extract a string from it. |
| labelExtractor | (Required) Function to extract string value for label from item |
| separators | An array of characters to use as tag separators |
| regex | A RegExp to test tags after enter, space, or a comma is pressed |
| tagColor | Background color of tags |
| tagTextColor | Text color of tags |
| tagContainerStyle | Styling override for container surrounding tag text |
| tagTextStyle | Styling override for tag's text component |
| inputColor | Color of text input |
| inputProps | Any misc. TextInput props (autofocus, placeholder, returnKeyType, etc.) |
| maxHeight | Max height of the tag input on screen (will scroll if max height reached) |
| onHeightChange | Callback that gets passed the new component height when it changes |
| parseOnBlur | Whether to treat a blur event as a separator entry (iOS-only) |
| parseOnSubmit | Whether to treat submit button press as a separator entry |
| scrollHorizontal | Whether the wrapper scrollView should scroll horizontally |
| scrollViewProps | Any misc. ScrollView props (showsHorizontalScrollIndicator, etc.) |

| Public Useful Method | Description |
-----------------------|-----------------
| addNewTag | Replace pending input with suggested custom tag |
