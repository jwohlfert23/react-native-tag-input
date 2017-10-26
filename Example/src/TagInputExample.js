import React, { Component } from 'react';
import {
  Text,
  View,
  Platform,
} from 'react-native';
import TagInput from 'react-native-tag-input';

const inputProps = {
  keyboardType: 'default',
  placeholder: 'email',
  autoFocus: true,
  style: {
    fontSize: 14,
    marginVertical: Platform.OS == 'ios' ? 10 : -2,
  },
};

const horizontalInputProps = {
  keyboardType: 'default',
  returnKeyType: 'search',
  placeholder: 'Search',
  style: {
    fontSize: 14,
    marginVertical: Platform.OS == 'ios' ? 10 : -2,
  },
};

const horizontalScrollViewProps = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
};

export default class TagInputExample extends Component {
  state = {
    tags: [],
    text: "",
    horizontalTags: [],
    horizontalText: "",
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

  onChangeHorizontalTags = (horizontalTags) => {
    this.setState({
      horizontalTags,
    });
  };

  onChangeHorizontalText = (horizontalText) => {
    this.setState({ horizontalText });

    const lastTyped = horizontalText.charAt(horizontalText.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        horizontalTags: [...this.state.horizontalTags, this.state.horizontalText],
        horizontalText: "",
      });
      this._horizontalTagInput.scrollToEnd();
    }
  }

  render() {
    return (
      <View style={{ flex: 1, margin: 10, marginTop: 30 }}>

        <Text style={{marginVertical: 10}}>Vertical Scroll</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'lightgray'}}>
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

        <Text style={{marginVertical: 10}}>Horizontal Scroll</Text>
        <View style={{marginBottom: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'lightgray'}}>
          <Text>To: </Text>
          <TagInput
            ref={(horizontalTagInput) => {this._horizontalTagInput = horizontalTagInput}}
            value={this.state.horizontalTags}
            onChange={this.onChangeHorizontalTags}
            labelExtractor={this.labelExtractor}
            text={this.state.horizontalText}
            onChangeText={this.onChangeHorizontalText}
            tagColor="blue"
            tagTextColor="white"
            inputProps={horizontalInputProps}
            scrollViewProps={horizontalScrollViewProps}
          />
        </View>

      </View>
    );
  }
}
