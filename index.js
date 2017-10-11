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
   * Styling override for the overall container view
   */
  containerStyle: StyleObj,
  /**
   * Color of text input
   */
  inputColor: string,
  /**
   * Any misc. TextInput props (autofocus, placeholder, returnKeyType, etc.)
   */
  inputProps?: $PropertyType<TextInput, 'props'>,
  /**
   * Max height of the tag input on screen (will scroll if max height reached)
   */
  maxHeight: number,
  /**
   * Max number of tags that can be added
   */
  maxTags: number,
  /**
   * Callback that gets passed the new component height when it changes
   */
  onHeightChange?: (height: number) => void,
  /**
   * Disable automatic scrolling to bottom if specified
   */
  noAutoScroll: bool,
  /**
   * Whether to treat a blur event as a separator entry (iOS-only)
   */
  parseOnBlur: bool,
};
type Props<T> = RequiredProps<T> & OptionalProps;
type State = {
  text: string,
  inputWidth: number,
  wrapperHeight: number,
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
    maxHeight: PropTypes.number,
    onHeightChange: PropTypes.func,
    parseOnBlur: PropTypes.bool,
  };
  props: Props<T>;
  state: State = {
    text: '',
    inputWidth: 90,
    wrapperHeight: 36,
  };
  wrapperWidth = windowWidth;
  spaceLeft = 0;
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
    maxHeight: 75,
    parseOnBlur: false,
  };

  static inputWidth(text: string, spaceLeft: number, wrapperWidth: number) {
    if (text === "") {
      return 90;
    } else if (spaceLeft >= 100) {
      return spaceLeft - 10;
    } else {
      return wrapperWidth;
    }
  }

  componentWillReceiveProps(nextProps: Props<T>) {
    const wrapperHeight = Math.min(
      nextProps.maxHeight,
      this.contentHeight,
    );
    if (wrapperHeight !== this.state.wrapperHeight) {
      this.setState({ wrapperHeight });
    }
  }

  componentWillUpdate(nextProps: Props<T>, nextState: State) {
    const inputWidth = TagInput.inputWidth(
      nextState.text,
      this.spaceLeft,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
    if (
      this.props.onHeightChange &&
      nextState.wrapperHeight !== this.state.wrapperHeight
    ) {
      this.props.onHeightChange(nextState.wrapperHeight);
    }
  }

  measureWrapper = (event: { nativeEvent: { layout: { width: number } } }) => {
    this.wrapperWidth = event.nativeEvent.layout.width;
    const inputWidth = TagInput.inputWidth(
      this.state.text,
      this.spaceLeft,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
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
    if (this.props.noAutoScroll) {
      return;
    }

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
    const { text } = this.state;
    const { inputColor } = this.props;

    const inputProps = { ...defaultInputProps, ...this.props.inputProps };

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
        <View style={[styles.wrapper, { height: this.state.wrapperHeight }]}>
          <ScrollView
            ref={this.scrollViewRef}
            style={styles.tagInputContainerScroll}
            onContentSizeChange={this.onScrollViewContentSizeChange}
            onLayout={this.onScrollViewLayout}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.tagInputContainer, this.props.containerStyle]}>
              {tags}
              {
                (this.props.maxTags && this.props.value.length < this.props.maxTags) &&
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
                        width: this.state.inputWidth,
                        color: inputColor,
                      }]}
                      onBlur={this.onBlur}
                      onChangeText={this.onChangeText}
                      onSubmitEditing={this.parseTags}
                      {...inputProps}
                    />
                  </View>
                }
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
    if (this.contentHeight === h) {
      return;
    }
    const nextWrapperHeight = Math.min(this.props.maxHeight, h);
    if (nextWrapperHeight !== this.state.wrapperHeight) {
      this.setState(
        { wrapperHeight: nextWrapperHeight },
        this.contentHeight < h ? this.scrollToBottom : undefined,
      );
    } else if (this.contentHeight < h) {
      this.scrollToBottom();
    }
    this.contentHeight = h;
  }

  onScrollViewLayout = (
    event: { nativeEvent: { layout: { height: number } } },
  ) => {
    this.scrollViewHeight = event.nativeEvent.layout.height;
  }

  onLayoutLastTag = (endPosOfTag: number) => {
    const margin = 3;
    this.spaceLeft = this.wrapperWidth - endPosOfTag - margin - 10;
    const inputWidth = TagInput.inputWidth(
      this.state.text,
      this.spaceLeft,
      this.wrapperWidth,
    );
    if (inputWidth !== this.state.inputWidth) {
      this.setState({ inputWidth });
    }
  }

}

type TagProps = {
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
class Tag extends React.PureComponent {

  props: TagProps;
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
  curPos: ?number = null;

  componentWillReceiveProps(nextProps: TagProps) {
    if (
      !this.props.isLastTag &&
      nextProps.isLastTag &&
      this.curPos !== null &&
      this.curPos !== undefined
    ) {
      this.props.onLayoutLastTag(this.curPos);
    }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.onPress}
        onLayout={this.onLayoutLastTag}
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
    this.curPos = layout.width + layout.x;
    if (this.props.isLastTag) {
      this.props.onLayoutLastTag(this.curPos);
    }
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
