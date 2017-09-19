// @flow

import type {
  StyleObj,
} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  ViewPropTypes,
  Platform,
} from 'react-native';
import invariant from 'invariant';

const windowWidth = Dimensions.get('window').width;
const defaultInputProps = {
  autoCapitalize: 'none',
  autoCorrect: false,
  placeholder: 'Start typing',
  returnKeyType: 'done',
  keyboardType: 'default',
  underlineColorAndroid: 'rgba(0,0,0,0)',
};

type RequiredProps<T> = {
  /**
   * A handler to be called when array of tags change.
   * When new tags are added, they are appended as strings. If you use a
   * non-string item type, make sure to either translate the strings to your
   * item type before passing this value on to the "value" prop, or otherwise
   * make sure your labelExtractor can handle both your item type and strings.
   */
  onChange: (items: $ReadOnlyArray<T | string>) => void,
  /**
   * An array of tags, which can be any type, as long as labelExtractor below
   * can extract a string from it.
   */
  value: $ReadOnlyArray<T>,
  /**
   * Function to extract string value for label from item
   */
  labelExtractor: (tagData: T) => string,
};
type OptionalProps = {
  /**
   * An array of characters to use as tag separators
   */
  separators: $ReadOnlyArray<string>,
  /**
   * A RegExp to test tags after enter, space, or a comma is pressed
   */
  regex: RegExp,
  /**
   * Background color of tags
   */
  tagColor: string,
  /**
   * Text color of tags
   */
  tagTextColor: string,
  /**
   * Styling override for container surrounding tag text
   */
  tagContainerStyle?: StyleObj,
  /**
   * Styling override for tag's text component
   */
  tagTextStyle?: StyleObj,
  /**
   * Color of text input
   */
  inputColor: string,
  /**
   * Any misc. TextInput props (autofocus, placeholder, returnKeyType, etc.)
   */
  inputProps?: $PropertyType<TextInput, 'props'>,
  /**
   * Maximum number of lines of the tag input
   */
  numberOfLines: number,
  /**
   * whether to treat a blur event as a separator entry (iOS-only)
   */
  parseOnBlur: bool,
};
type Props<T> = RequiredProps<T> & OptionalProps;
type State = {
  text: string,
  inputWidth: ?number,
  lines: number,
};

const DEFAULT_SEPARATORS = [',', ' ', ';', '\n'];
const DEFAULT_TAG_REGEX = /(.+)/gi;

class TagInput<T> extends React.PureComponent<OptionalProps, Props<T>, State> {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    labelExtractor: PropTypes.func.isRequired,
    separators: PropTypes.arrayOf(PropTypes.string),
    regex: PropTypes.object,
    tagColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    tagContainerStyle: ViewPropTypes.style,
    tagTextStyle: Text.propTypes.style,
    inputColor: PropTypes.string,
    inputProps: PropTypes.shape(TextInput.propTypes),
    numberOfLines: PropTypes.number,
    parseOnBlur: PropTypes.bool,
  };
  props: Props<T>;
  state: State = {
    text: '',
    inputWidth: null,
    lines: 1,
  };
  wrapperWidth = windowWidth;
  // scroll to bottom
  contentHeight = 0;
  scrollViewHeight = 0;
  // refs
  tagInput: ?TextInput = null;
  scrollView: ?ScrollView = null;

  static defaultProps = {
    separators: DEFAULT_SEPARATORS,
    regex: DEFAULT_TAG_REGEX,
    tagColor: '#dddddd',
    tagTextColor: '#777777',
    inputColor: '#777777',
    numberOfLines: 2,
    parseOnBlur: false,
  };

  measureWrapper = (event: { nativeEvent: { layout: { width: number } } }) => {
    this.wrapperWidth = event.nativeEvent.layout.width;
    this.setState({ inputWidth: this.wrapperWidth });
  }

  onChangeText = (text: string) => {
    this.setState({ text: text });
    const lastTyped = text.charAt(text.length - 1);

    const parseWhen = this.props.separators;

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.parseTags();
    }
  }

  onBlur = (event: { nativeEvent: { text: string } }) => {
    if (Platform.OS === "ios" && this.props.parseOnBlur) {
      this.setState({ text: event.nativeEvent.text }, this.parseTags);
    } else if (Platform.OS === "ios") {
      this.setState({ text: event.nativeEvent.text });
    } else if (this.props.parseOnBlur) {
      this.parseTags();
    }
  }

  parseTags = () => {
    const { text } = this.state;
    const { value } = this.props;

    const regex = this.props.regex;
    const results = text.match(regex);

    if (results && results.length > 0) {
      this.setState({ text: '' });
      this.props.onChange([...new Set([...value, ...results])]);
    }
  }

  onKeyPress = (event: { nativeEvent: { key: string } }) => {
    if (this.state.text !== '' || event.nativeEvent.key !== 'Backspace') {
      return;
    }
    const tags = [...this.props.value];
    tags.pop();
    this.props.onChange(tags);
    this.focus();
  }

  focus = () => {
    invariant(this.tagInput, "should be set");
    this.tagInput.focus();
  }

  removeIndex = (index: number) => {
    const tags = [...this.props.value];
    tags.splice(index, 1);
    this.props.onChange(tags);
  }

  scrollToBottom = () => {
    const y = this.contentHeight - this.scrollViewHeight;
    if (y <= 0) {
      return;
    }
    const scrollView = this.scrollView;
    invariant(
      scrollView,
      "this.scrollView ref should exist before scrollToBottom called",
    );
    scrollView.scrollTo({ y, animated: true });
  }

  render() {
    const { text, inputWidth, lines } = this.state;
    const { inputColor } = this.props;

    const inputProps = { ...defaultInputProps, ...this.props.inputProps };

    const wrapperHeight = (lines - 1) * 40 + 36;

    const width = inputWidth ? inputWidth : 400;

    const tags = this.props.value.map((tag, index) => (
      <Tag
        index={index}
        label={this.props.labelExtractor(tag)}
        isLastTag={this.props.value.length === index + 1}
        onLayoutLastTag={this.onLayoutLastTag}
        removeIndex={this.removeIndex}
        tagColor={this.props.tagColor}
        tagTextColor={this.props.tagTextColor}
        tagContainerStyle={this.props.tagContainerStyle}
        tagTextStyle={this.props.tagTextStyle}
        key={index}
      />
    ));

    return (
      <TouchableWithoutFeedback
        onPress={this.focus}
        style={styles.container}
        onLayout={this.measureWrapper}
      >
        <View style={[styles.wrapper, { height: wrapperHeight }]}>
          <ScrollView
            ref={this.scrollViewRef}
            style={styles.tagInputContainerScroll}
            onContentSizeChange={this.onScrollViewContentSizeChange}
            onLayout={this.onScrollViewLayout}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.tagInputContainer}>
              {tags}
              <View style={[
                styles.textInputContainer,
                { width: this.state.inputWidth },
              ]}>
                <TextInput
                  ref={this.tagInputRef}
                  blurOnSubmit={false}
                  onKeyPress={this.onKeyPress}
                  value={text}
                  style={[styles.textInput, {
                    width: width,
                    color: inputColor,
                  }]}
                  onBlur={this.onBlur}
                  onChangeText={this.onChangeText}
                  onSubmitEditing={this.parseTags}
                  {...inputProps}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  tagInputRef = (tagInput: TextInput) => {
    this.tagInput = tagInput;
  }

  scrollViewRef = (scrollView: ScrollView) => {
    this.scrollView = scrollView;
  }

  onScrollViewContentSizeChange = (w: number, h: number) => {
    this.contentHeight = h;
  }

  onScrollViewLayout = (
    event: { nativeEvent: { layout: { height: number } } },
  ) => {
    this.scrollViewHeight = event.nativeEvent.layout.height;
  }

  onLayoutLastTag = (endPosOfTag: number) => {
    const margin = 3;
    const spaceLeft = this.wrapperWidth - endPosOfTag - margin - 10;

    const inputWidth = (spaceLeft < 100) ? this.wrapperWidth : spaceLeft - 10;

    if (spaceLeft < 100) {
      if (this.state.lines < this.props.numberOfLines) {
        const lines = this.state.lines + 1;

        this.setState({ inputWidth, lines });
      } else {
        this.setState({ inputWidth }, this.scrollToBottom);
      }
    } else {
      this.setState({ inputWidth });
    }
  }

}

class Tag extends React.PureComponent {

  props: {
    index: number,
    label: string,
    isLastTag: bool,
    onLayoutLastTag: (endPosOfTag: number) => void,
    removeIndex: (index: number) => void,
    tagColor: string,
    tagTextColor: string,
    tagContainerStyle?: StyleObj,
    tagTextStyle?: StyleObj,
  };
  static propTypes = {
    index: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    isLastTag: PropTypes.bool.isRequired,
    onLayoutLastTag: PropTypes.func.isRequired,
    removeIndex: PropTypes.func.isRequired,
    tagColor: PropTypes.string.isRequired,
    tagTextColor: PropTypes.string.isRequired,
    tagContainerStyle: ViewPropTypes.style,
    tagTextStyle: Text.propTypes.style,
  };

  render() {
    let onLayout = undefined;
    if (this.props.isLastTag) {
      onLayout = this.onLayoutLastTag;
    }
    return (
      <TouchableOpacity
        onPress={this.onPress}
        onLayout={onLayout}
        style={[
          styles.tag,
          { backgroundColor: this.props.tagColor },
          this.props.tagContainerStyle,
        ]}
      >
        <Text style={[
          styles.tagText,
          { color: this.props.tagTextColor },
          this.props.tagTextStyle,
        ]}>
          {this.props.label}
          &nbsp;&times;
        </Text>
      </TouchableOpacity>
    );
  }

  onPress = () => {
    this.props.removeIndex(this.props.index);
  }

  onLayoutLastTag = (
    event: { nativeEvent: { layout: { x: number, width: number } } },
  ) => {
    const layout = event.nativeEvent.layout;
    this.props.onLayoutLastTag(layout.width + layout.x);
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 2,
    alignItems: 'flex-start',
  },
  tagInputContainerScroll: {
    flex: 1,
  },
  tagInputContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    height: 36,
    fontSize: 16,
    flex: .6,
    marginBottom: 6,
    padding: 0,
  },
  textInputContainer: {
    height: 36,
  },
  tag: {
    justifyContent: 'center',
    marginTop: 6,
    marginRight: 3,
    padding: 8,
    height: 24,
    borderRadius: 2,
  },
  tagText: {
    padding: 0,
    margin: 0,
  },
});

export default TagInput;

export { DEFAULT_SEPARATORS, DEFAULT_TAG_REGEX }
