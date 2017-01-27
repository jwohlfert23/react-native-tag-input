# React Native Tag Input

![alt text](example.png "Example visual")

Simple Example

```
import TagInput from 'react-native-tag-input';

...

<TagInput
  value={this.state.emails}
  onChange={(emails) => this.onEmailChange(emails)} />
```

| Available Properties | Description |
-----------------------|-----------------
| onChange | (Required) A handler to be called when array of emails/tags change |
| value | (Required) An array of tags |
| separators | An array os characters to use as tag separators |
| regex | A RegExp to test tags after enter, space, or a comma is pressed |
| tagColor | Background color of tags |
| tagTextColor | Text color of tags |
| tagContainerStyle | Styling override for container surrounding tag text. |
| tagTextStyle | Styling overrride for tag's text component |
| inputColor | Color of text input |
| inputProps | Any misc. TextInput props (autofocus, returnKeyType, etc.) |
| labelKey | String. Label key if tag is an object, (tag[labelKey]) |
| numberOfLines | Number. Number of maximum lines of the tag input |
| parseOnBlur | Boolean. If true, will check for tags on input blur |
