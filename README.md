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
| value | (Required) An array of tags |
| onChange | (Required) A handler to be called when array of emails/tags change |
| regex | A RegExp to test tags after enter, space, or a comma is pressed |
| tagColor | Background color of tags |
| tagTextColor | Text color of tags |
| inputColor | Color of text input |
