# React Native Tag Input

![alt text](example.png "Example visual")

Simple Example

```javascript
import TagInput from 'react-native-tag-input';

...

<TagInput
  value={this.state.emails}
  onChange={(emails) => this.onEmailChange(emails)} />
```

Example with custom input renderer

```javascript
import TagInput from 'react-native-tag-input';
import AutoComplete from 'auto-complete-library';

...

const autoCompleteRenderer = (tagInputProps) => {
  const autoCompleteProps = {
    ...tagInputProps,
    suggestions: ['tag1', 'tag2'],
    onChangeText: tagInputProps.onChange,
    onSelect: (tag) => {
      tagInputProps.onChange({ // call the change function as if the user was typing
        nativeEvent: {
          text: `${tag}` // or `${tag}${SEPARATOR}` if the tag should be added after selection
        }
      })
    }
  };

  return (
    <AutoComplete {...autoCompleteProps} />
  );
};

<TagInput
  value={this.state.tags}
  onChange={(tags) => this.onEmailChange(tags)}
  inputRenderer={autoCompleteRenderer} />
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
| inputRenderer | function receiving props. Function used to render a custom input for the tags, if none is supplied, the default TextInput is used |
