import React, { forwardRef, HTMLAttributes } from "react";
import classNames from "classnames";

import styles from "./TreeItem.module.css";
import { Action } from "../Item/Action/Action";
import { Handle } from "../Item/Handle/Handle";
import { Remove } from "../Item/Remove/Remove";
import styled, { css } from "styled-components";

export interface TreeItemProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  label: string;
  type: string;
  depthLabel: string;
  selected: boolean;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

const StyledTypeBadge = styled.span`
  background-color: #ae1065;
  color: #fff;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 2px;
  font-weight: 600;
  transition: all 0.3s ease;
`;

const StyledDepthLabel = styled.span`
  padding: 6px 12px;
  border: 1px solid #1c1c1c4d;
  border-radius: 60px;
  font-weight: 500;
  font-size: 14px;
  color: #1c1c1c4d;
  transition: all 0.3s ease;
`;

const StyledTreeItem = styled.div<{ $selected: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background-color: #f3f3f3;
  border: 1px solid #dedede;
  color: #222;
  box-sizing: border-box;

  ${({ $selected }) =>
    $selected
      ? css`
          ${StyledDepthLabel} {
            border-color: #ffffff80;
            color: #ffffff80;
          }

          ${StyledTypeBadge} {
            background-color: #d54593;
          }
        `
      : ``}
`;

const StyledWrapper = styled.li<{
  $ghost: boolean | undefined;
  $spacing: number;
  $indicator: boolean | undefined;
  $clone: boolean | undefined;
  $disableInteraction: boolean | undefined;
  $disableSelection: boolean | undefined;
}>`
  list-style: none;
  box-sizing: border-box;
  margin-bottom: -1px;
  ${({ $spacing }) =>
    css`
      padding-left: ${$spacing}px;
    `}

  ${({ $ghost, $indicator }) =>
    $ghost
      ? css`
          ${$indicator
            ? css`
                opacity: 1;
                position: relative;
                z-index: 1;
                margin-bottom: -1px;

                ${StyledTreeItem} {
                  position: relative;
                  padding: 0;
                  height: 8px;
                  border-color: #2389ff;
                  background-color: #56a1f8;

                  &:before {
                    position: absolute;
                    left: -8px;
                    top: -4px;
                    display: block;
                    content: "";
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 1px solid #2389ff;
                    background-color: #ffffff;
                  }

                  > * {
                    /* Items are hidden using height and opacity to retain focus */
                    opacity: 0;
                    height: 0;
                  }
                }
              `
            : css`
                opacity: 0.5;
              `}
          & > * {
            box-shadow: none;
            background-color: transparent;
          }
        `
      : ``}
  ${({ $clone }) =>
    $clone
      ? css`
          display: inline-block;
          pointer-events: none;
          padding: 0;
          padding-left: 10px;
          padding-top: 5px;

          ${StyledTreeItem} {
            padding-right: 24px;
            border-radius: 4px;
            box-shadow: 0px 15px 15px 0 rgba(34, 33, 81, 0.1);
          }
        `
      : ``}
  ${({ $ghost }) => ($ghost ? css`` : ``)}
`;

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      label,
      selected,
      depthLabel,
      type,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <StyledWrapper
        $ghost={ghost}
        $indicator={indicator}
        $clone={clone}
        $disableSelection={disableSelection}
        $disableInteraction={disableInteraction}
        $spacing={indentationWidth * depth}
        ref={wrapperRef}
        {...props}
      >
        <StyledTreeItem
          $selected={selected}
          ref={ref}
          style={style}
        >
          <Handle {...handleProps} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed
              )}
            >
              {collapseIcon}
            </Action>
          )}
          <StyledDepthLabel>{depthLabel}</StyledDepthLabel>
          <span className={styles.Text}>{label}</span>
          <StyledTypeBadge>{type}</StyledTypeBadge>
          {!clone && onRemove && (
            <Remove
              style={{ marginLeft: "auto" }}
              onClick={onRemove}
            />
          )}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </StyledTreeItem>
      </StyledWrapper>
    );
  }
);

const collapseIcon = (
  <svg
    width="10"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 70 41"
  >
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);
