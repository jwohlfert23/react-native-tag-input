import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import TagInput from 'react-native-tag-input';

const inputProps = {
  keyboardType: 'default',
  placeholder: 'email',
  autoFocus: true,
};

export default class TagInputExample extends Component {
  state = {
    tags: [],
    text: "",
  };

  onChangeTags = (tags) => {
    this.setState({ tags });
  }

  onChangeText = (text) => {
    this.setState({ text });

    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        tags: [...this.state.tags, this.state.text],
        text: "",
      });
    }
  }

  labelExtractor = (tag) => tag;

  render() {
    return (
      <View style={{ flex: 1, margin: 10, marginTop: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text>To: </Text>
          <TagInput
            value={this.state.tags}
            onChange={this.onChangeTags}
            labelExtractor={this.labelExtractor}
            text={this.state.text}
            onChangeText={this.onChangeText}
            tagColor="blue"
            tagTextColor="white"
            inputProps={inputProps}
            maxHeight={75}
          />
        </View>
      </View>
    );
  }
}
